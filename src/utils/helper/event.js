export default function event(clientName, companyName, clientEmail, dateTime) {
    return {
        'summary': 'Free consultation with DBO',
        'description': `Company-name: ${companyName}`,
        'start': {
            'dateTime': dateTime['start'],
            'timeZone': 'Asia/Kolkata'
        },
        'end': {
            'dateTime': dateTime['end'],
            'timeZone': 'Asia/Kolkata'
        },
        'attendees': [
            {
                'displayName': `${clientName}`,
                'email': `${clientEmail}`,
            },
        ],
        'conferenceData': {
            'createRequest': {
                'conferenceSolution': {
                    'key': {
                        'type': 'hangoutsMeet'
                    }
                },
                'requestId': Math.random().toString(36).substring(7),
            },
        },
        'reminders': {
            'useDefault': false,
            'overrides': [
                { 'method': 'email', 'minutes': 24 * 60 },
                { 'method': 'popup', 'minutes': 30 },
            ],
        },
    }
};
