/**
 *
 * @param {Date|string|undefined} date
 * @return {Date|undefined}
 */
export const normalizeDate = (date) => {
    if (!date) {
        return undefined;
    }
    if (date === "now") {
        return new Date();
    }

    return new Date(date);
}