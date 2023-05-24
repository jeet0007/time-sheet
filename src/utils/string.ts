export const pluralize = (value: number, singleUnit: string, pluralUnit = `${singleUnit}s`) => {
    const unit = Number(value) === 1 ? singleUnit : pluralUnit;
    return `${value} ${unit}`;
};
