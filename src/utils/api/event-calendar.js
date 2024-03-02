export default class Calendar {
    constructor(eventCreate) { 
        this.CLIENT_ID = import.meta.env.PUBLIC_CLIENT_ID;
        this.API_KEY = import.meta.env.PUBLIC_API_KEY;
        this.DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
        this.SCOPES = 'https://www.googleapis.com/auth/calendar';
        this.tokenClient = ''
        this.gapiInited = false;
        this.gisInited = false;
        this.event = eventCreate;

        this.initializeGapiClient = this.initializeGapiClient.bind(this);
        this.gapiLoaded = this.gapiLoaded.bind(this);
        this.gisLoaded = this.gisLoaded.bind(this);
        this.handleAuthClick = this.handleAuthClick.bind(this);
        this.createEvent = this.createEvent.bind(this);
    }

    async gapiLoaded() {
        return new Promise((resolve, reject) => {
            gapi.load('client', () => {
                this.initializeGapiClient().then(resolve, reject);
            });
        });
    }

    async initializeGapiClient() {
        await gapi.client.init({
            apiKey: this.API_KEY,
            discoveryDocs: [this.DISCOVERY_DOC],
        });
        this.gapiInited = true;
    }

    gisLoaded() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: this.CLIENT_ID,
            scope: this.SCOPES,
            callback: '', // defined later
        });
        this.gisInited = true;
    }

    handleAuthClick() {
        this.tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                throw (resp);
            }
            await this.createEvent();
        };
        
        if (gapi.client.getToken() === undefined) {
            // Prompt the user to select a Google Account and ask for consent to share their data
            // when establishing a new session.
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
            console.log(gapi.client.getToken())
        } else {
            // Skip display of account chooser and consent dialog for an existing session.
            this.tokenClient.requestAccessToken({ prompt: '' });
        }
    }

    async createEvent() {
        let response;
        try {
            const request = {
                'calendarId': 'primary',
                'resource': this.event,
                'sendUpdates': 'all',
                'conferenceDataVersion': 1
            };
            response = await gapi.client.calendar.events.insert(request);
        } catch (err) {
            console.log(err);
            return;
        }
    }
}
