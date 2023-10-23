import { getPreferenceValues, OAuth } from '@raycast/api'
import fetch from 'node-fetch'
import { PreferencesType } from '../type/config'
import { Event } from '../type/Event'
import { Task } from '../type/Task'
import { googleEventFilter, mergeDuplicateTasks, parseEvent } from '../utils/googleEvent'

// Create an OAuth client ID via https://console.developers.google.com/apis/credentials
// As application type choose "iOS" (required for PKCE)
// As Bundle ID enter: com.raycast
const { googleClientId, googleEmail, calendarFilters }: PreferencesType = getPreferenceValues<PreferencesType>()
const clientId = googleClientId

const client = new OAuth.PKCEClient({
  redirectMethod: OAuth.RedirectMethod.AppURI,
  providerName: 'Google',
  providerIcon: 'google-logo.png',
  providerId: 'google',
  description: 'Connect your Google account\n',
})

// Authorization

export async function authorize(): Promise<void> {
  if (!client || !clientId) return
  const tokenSet = await client.getTokens()
  if (tokenSet?.accessToken) {
    if (tokenSet.refreshToken && tokenSet.isExpired()) {
      await client.setTokens(await refreshTokens(tokenSet.refreshToken))
    }
    return
  }

  const authRequest = await client.authorizationRequest({
    endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    clientId: clientId,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  })
  const { authorizationCode } = await client.authorize(authRequest)
  await client.setTokens(await fetchTokens(authRequest, authorizationCode))
}

async function fetchTokens(authRequest: OAuth.AuthorizationRequest, authCode: string): Promise<OAuth.TokenResponse> {
  if (!clientId) return Promise.reject(new Error('No Client ID or Client Secret provided'))
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('code', authCode)
  params.append('verifier', authRequest.codeVerifier)
  params.append('grant_type', 'authorization_code')
  params.append('redirect_uri', authRequest.redirectURI)

  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!response.ok) {
    console.error('fetch tokens error:', await response.text())
    throw new Error(response.statusText)
  }
  return (await response.json()) as OAuth.TokenResponse
}

async function refreshTokens(refreshToken: string): Promise<OAuth.TokenResponse> {
  if (!clientId) return Promise.reject(new Error('No Client ID provided'))
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('refresh_token', refreshToken)
  params.append('grant_type', 'refresh_token')

  const response = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!response.ok) {
    console.error('refresh tokens error:', await response.text())
    throw new Error(response.statusText)
  }
  const tokenResponse = (await response.json()) as OAuth.TokenResponse
  tokenResponse.refresh_token = tokenResponse.refresh_token ?? refreshToken
  return tokenResponse
}

// API

export async function fetchEvents(date: Date, endDate?: Date) {
  if (!clientId || !googleEmail) return []
  const params = new URLSearchParams()
  params.append('singleEvents', 'true')
  params.append('orderBy', 'startTime')
  const formattedStartDate = new Date(date.setUTCHours(0, 0, 0, 0))
  const formattedEndDate = endDate
    ? new Date(endDate.setUTCHours(23, 59, 59, 59))
    : new Date(date.setUTCHours(23, 59, 59, 59))
  params.append('timeMin', formattedStartDate.toISOString())
  params.append('timeMax', formattedEndDate.toISOString())
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${googleEmail}/events?` + params.toString(),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${(await client.getTokens())?.accessToken}`,
      },
    }
  )
  if (response.status === 401) {
    console.log('Clearing tokens')
    client.removeTokens()
  }
  if (!response.ok) {
    console.error('fetch Events error:', await response.text())
    throw new Error(response.statusText)
  }

  const json = (await response.json()) as { items: Event[] }
  const { items } = json
  let tasks: Task[] = items.filter(googleEventFilter).map((item: Event) => parseEvent(item))
  tasks = mergeDuplicateTasks(tasks)
  const filterCriteria = calendarFilters.split(',').map((item) => item.trim().toUpperCase())
  return tasks.filter((item: Task) => !filterCriteria.includes(item.task.toUpperCase()))
}
