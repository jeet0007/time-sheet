export const pluralize = (value: number, singleUnit: string, pluralUnit = `${singleUnit}s`) => {
    const unit = Number(value) === 1 ? singleUnit : pluralUnit;
    return `${value} ${unit}`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseJSON = (json: string | undefined, fallbackValue = null) => {
    try {
        if (!json) return fallbackValue;
        return JSON.parse(json);
    } catch (err) {
        return fallbackValue;
    }
};
