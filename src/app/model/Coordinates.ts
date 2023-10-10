export interface Coordinates {
    latitude: number,
    longitude: number,
    accuracy?: number,
    altitude?: number | null,
    altitudeAccuracy?: number | null | undefined,
    heading?: number | null,
    speed?: number | null,
    timestamp?: number
}