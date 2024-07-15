import parser from "iptv-playlist-parser";

/**
 * Parse M3U file from URL or string.
 *
 * @param {string} input - URL or string containing the M3U content.
 * @param {boolean} isURL - Flag indicating if the input is a URL.
 * @returns {Promise<Object>} - Parsed M3U content.
 * @throws {Error} - If parsing fails or the input is invalid.
 */
export async function ParseM3U(input, isURL = false) {
    try {
        const playlist = await fetchAndParse(input, isURL);
        return playlist;
    } catch (err) {
        return { error: err.message || err.iptv_parser_error };
    }
}

/**
 * Fetch and parse M3U file from URL or string.
 *
 * @param {string} input - URL or string containing the M3U content.
 * @param {boolean} isURL - Flag indicating if the input is a URL.
 * @returns {Promise<Object>} - Parsed M3U content.
 * @throws {Error} - If fetching or parsing fails.
 */
async function fetchAndParse(input, isURL) {
    if (!input) {
        throw new Error(isURL ? "URL to fetch is required" : "Text to parse is required");
    }

    let playlist = isURL ? await fetchPlaylist(input) : input;
    return validateAndParsePlaylist(playlist);
}

/**
 * Fetch playlist content from URL.
 *
 * @param {string} url - URL to fetch the playlist from.
 * @returns {Promise<string>} - Playlist content as a string.
 * @throws {Error} - If fetching fails.
 */
async function fetchPlaylist(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status} error`);
    }
    return await response.text();
}

/**
 * Validate and parse the playlist content.
 *
 * @param {string} content - Playlist content as a string.
 * @returns {Promise<Object>} - Parsed playlist content.
 * @throws {Error} - If the playlist is invalid.
 */
async function validatePlaylist(content) {
    const lines = content.split('\n').map((line, index) => ({ index, raw: line }));
    const firstLine = lines.find(line => line.index === 0);

    if (!firstLine || !/^#EXTM3U/.test(firstLine.raw)) {
        throw new Error("Playlist is not valid");
    }

    return parser.parse(content);
}
