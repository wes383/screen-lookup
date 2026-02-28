import ColorThief from 'colorthief';

export const getAverageColor = (
    imageUrl: string
): Promise<{ r: number; g: number; b: number } | null> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = () => {
            try {
                // @ts-expect-error type definitions are not perfectly aligned with module
                const colorThief = new ColorThief();
                // Get the dominant color
                const color = colorThief.getColor(img, 25);
                if (color && color.length >= 3) {
                    resolve({ r: color[0], g: color[1], b: color[2] });
                } else {
                    resolve(null);
                }
            } catch (e) {
                console.error("Error extracting image color with ColorThief", e);
                resolve(null);
            }
        };

        img.onerror = (e) => {
            console.error("Image loading error in colorExtractor", e);
            resolve(null);
        };

        const proxyUrl = imageUrl.replace('https://image.tmdb.org', '/tmdb-image');
        img.src = proxyUrl;
    });
};
