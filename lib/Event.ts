/** The data needed for an event card. */
export interface EventCard {
    /** The event item's ID/URL slug (in Bevy) for the short URL. */
    slugID: string;

    // TODO: Implement images.
    /** The URL of this event's image. */
    // image: string | null;

    /** The date when the event item starts as a unix timestamp. */
    date: number;

    /** The event item's title/headline. */
    title: string;

    /** The event item's description. */
    description: string;
}

/** Event data that needs to be stored internally but doesn't need to be given to the frontend. */
export interface EventData extends EventCard {
    /** The event item's numeric ID (for the Bevy API). */
    id: number;
}

/** The URL to request a list of published events from. */
const REQUEST_EVENTS_URL =
    "https://gdsc.community.dev/api/event/?chapter=1386&status=Published&order_by=-start_date&include_cohosted_events=true";

/** The data returned from {@link REQUEST_EVENTS_URL}. */
interface RequestEventsData {
    pagination: {
        // I think, at the moment it's null.
        next_page: string | null;
    };
    results: {
        id: number;
        title: string;
        /** ISO */
        start_data: string;
        /** ISO */
        end_data: string;
        url: string;
    }[];
}

/**
 * Gets a list of "partial" events.
 * These events lack a description, image, and slugID, which must be filled in by requesting
 * data for each event manually.
 *
 * If an error occurs, null is returned.
 */
async function getPartialEvents(): Promise<
    Omit<EventData, "description" | "image" | "slugID">[] | null
> {
    try {
        const data = (await fetch(REQUEST_EVENTS_URL).then((res) =>
            res.json(),
        )) as RequestEventsData;

        return data.results.map((result) => ({
            id: result.id,
            title: result.title,
            // Date.parse returns a timestamp with milliseconds.
            date: Math.floor(Date.parse(result.start_data) / 1000),
        }));
    } catch (e) {
        console.error(e);
        return null;
    }
}

/** The URL to prepend to an event's ID to get its data. */
const GET_EVENT_URL_PRE = "https://gdsc.community.dev/api/event/";

/** The data returned from {@link GET_EVENT_URL_PRE}. */
interface GetEventData {
    description_short: string;
    short_id: string;
    event_type_logo: {
        url: string;
    };
}

/**
 * "Fixes" partial events so they have all the required data.
 *
 * If an error occurs, null is returned.
 * @param partialEvents - is the list of partial events to "fix".
 */
async function fixPartialEvents(
    partialEvents: Omit<EventData, "description" | "image" | "slugID">[],
): Promise<EventData[] | null> {
    try {
        const events: EventData[] = [];

        // This is cached, so we aren't spamming the API.
        for (const partialEvent of partialEvents) {
            const data = (await fetch(GET_EVENT_URL_PRE + partialEvent.id).then(
                (res) => res.json(),
            )) as GetEventData;

            events.push({
                ...partialEvent,
                description: data.description_short,
                slugID: data.short_id,
            });
        }

        return events;
    } catch (e) {
        console.error(e);
        return null;
    }
}

/**
 * Converts an {@link EventData} to an {@link EventCard}.
 * @param data - is the data to convert.
 */
function dataToCard(data: EventData): EventCard {
    return {
        slugID: data.slugID,
        date: data.date,
        title: data.title,
        description: data.description,
    };
}

/**
 * Gets the data needed to display several event cards.
 * @param count - is the maximum number of entries to return.
 */
export async function getEventCards(count: number): Promise<EventCard[]> {
    // TODO: Implement.
    return [
        {
            id: "example-item",
            image: null,
            date: 1693961460,
            title: "This is an Event Item",
            description: "A sample event item to use.",
        },
        {
            id: "example-item-2",
            image: null,
            date: 1793961460,
            title: "This is a Second Event Item",
            description: "A second sample event item to use.",
        },
    ];
}
