import "https://cdn.jsdelivr.net/gh/orestbida/cookieconsent@v3.0.0/dist/cookieconsent.umd.js";

CookieConsent.run({
    guiOptions: {
        consentModal: {
            layout: "bar wide",
            position: "bottom",
        },
    },

    categories: {
        necessary: {
            enabled: true, // this category is enabled by default
            readOnly: true, // this category cannot be disabled
        },
        analytics: {},
    },

    language: {
        default: "en",
        translations: {
            en: {
                consentModal: {
                    title:
                        "This website uses cookies to ensure you get the best experience on our website.",
                    // description: 'Cookie modal description',

                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    showPreferencesBtn: "Manage Individual preferences",
                },
                preferencesModal: {
                    title: "Manage cookie preferences",
                    acceptAllBtn: "Accept all",
                    acceptNecessaryBtn: "Reject all",
                    savePreferencesBtn: "Accept current selection",
                    closeIconLabel: "Close modal",
                    sections: [
                        {
                            title: "Somebody said ... cookies?",
                            description: "I want one!",
                        },
                        {
                            title: "Strictly Necessary cookies",
                            description:
                                "These cookies are essential for the proper functioning of the website and cannot be disabled.",

                            //this field will generate a toggle linked to the 'necessary' category
                            linkedCategory: "necessary",
                        },
                        {
                            title: "Performance and Analytics",
                            description:
                                "These cookies collect information about how you use our website. All of the data is anonymized and cannot be used to identify you.",
                            linkedCategory: "analytics",
                        },
                        {
                            title: "More information",
                            description:
                                'For any queries in relation to my policy on cookies and your choices, please <a href="#contact-page">contact us</a>',
                        },
                    ],
                },
            },
        },
    },
});