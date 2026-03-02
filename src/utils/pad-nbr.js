/**
 * @param {number} num
 * @returns {string}
 */
export const pad = (num) => {
    const norm = Math.floor(Math.abs(num));
    return `${norm < 10 ? "0" : ""}${norm}`;
}