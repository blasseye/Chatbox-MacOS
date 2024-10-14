let totalMessages = 0, messagesLimit = 0, nickColor = "user", removeSelector, addition, customNickColor, channelName,
    provider;
let animationIn = 'bounceIn';
let animationOut = 'bounceOut';
let hideAfter = 60;
let hideCommands = "no";
let ignoredUsers = [];
let previousSender = "";
let mergeMessages = false;

const tchat = document.querySelector('#tchat')

window.addEventListener('onEventReceived', function (obj) {
    if (obj.detail.event.listener === 'widget-button') {

        if (obj.detail.event.field === 'testMessage') {
            let emulated = new CustomEvent("onEventReceived", {
                detail: {
                    listener: "message", event: {
                        service: "twitch",
                        data: {
                            time: Date.now(),
                            tags: {
                                "badge-info": "",
                                badges: "moderator/1,partner/1",
                                color: "#5B99FF",
                                "display-name": "StreamElements",
                                emotes: "25:46-50",
                                flags: "",
                                id: "43285909-412c-4eee-b80d-89f72ba53142",
                                mod: "1",
                                "room-id": "85827806",
                                subscriber: "0",
                                "tmi-sent-ts": "1579444549265",
                                turbo: "0",
                                "user-id": "100135110",
                                "user-type": "mod"
                            },
                            nick: 'Tracoeur_',
                            userId: "100135110",
                            displayName: 'Tracoeur_',
                            displayColor: "#5B99FF",
                            badges: [{
                                type: "moderator",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/3267646d-33f0-4b17-b3df-f923a41db1d0/3",
                                description: "Moderator"
                            }, {
                                type: "partner",
                                version: "1",
                                url: "https://static-cdn.jtvnw.net/badges/v1/d12a2e27-16f6-41d0-ab77-b780518f00a3/3",
                                description: "Verified"
                            }],
                            channel: 'Tracoeur_',
                            text: "Howdy! My name is Bill and I am here to serve Kappa",
                            isAction: !1,
                            emotes: [{
                                type: "twitch",
                                name: "Kappa",
                                id: "25",
                                gif: !1,
                                urls: {
                                    1: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    2: "https://static-cdn.jtvnw.net/emoticons/v1/25/1.0",
                                    4: "https://static-cdn.jtvnw.net/emoticons/v1/25/3.0"
                                },
                                start: 46,
                                end: 50
                            }],
                            msgId: "43285909-412c-4eee-b80d-89f72ba53142"
                        },
                        renderedText: 'Howdy! My name is Bill and I am here to serve <img src="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0" srcset="https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 1x, https://static-cdn.jtvnw.net/emoticons/v1/25/1.0 2x, https://static-cdn.jtvnw.net/emoticons/v1/25/3.0 4x" title="Kappa" class="emote">'
                    }
                }
            });
            window.dispatchEvent(emulated);
        }
        return;
    }
    if (obj.detail.listener === "delete-message") {
        const msgId = obj.detail.event.msgId;
        document.querySelectorAll(`#message-${msgId}`).forEach(el => el.remove())
        return;
    } else if (obj.detail.listener === "delete-messages") {
        const sender = obj.detail.event.userId;
        document.querySelectorAll(`.message[data-sender=${sender}]`).forEach(el => el.remove())
        return;
    }

    if (obj.detail.listener !== "message") return;
    addMessage(obj.detail.event.data, obj.detail.event.renderedText);
});

window.addEventListener('onWidgetLoad', function (obj) {
    const fieldData = obj.detail.fieldData;
    animationIn = fieldData.animationIn;
    animationOut = fieldData.animationOut;
    hideAfter = fieldData.hideAfter;
    messagesLimit = fieldData.messagesLimit;
    nickColor = fieldData.nickColor;
    customNickColor = fieldData.customNickColor;
    hideCommands = fieldData.hideCommands;
    channelName = obj.detail.channel.username;
    mergeMessages = fieldData.mergeMessages === "yes";
    fetch('https://api.streamelements.com/kappa/v2/channels/' + obj.detail.channel.id + '/').then(response => response.json()).then((profile) => {
        provider = profile.provider;
    });
    if (fieldData.alignMessages === "block") {
        addition = "prepend";
        removeSelector = ".message-row:nth-child(n+" + (messagesLimit + 1) + ")"
    } else {
        addition = "append";
        removeSelector = ".message-row:nth-last-child(n+" + (messagesLimit + 1) + ")"
    }

    ignoredUsers = fieldData.ignoredUsers.toLowerCase().replace(" ", "").split(",");
});


function attachEmotes(message) {
    let text = html_encode(message.text);
    let data = message.emotes;
    if (typeof message.attachment !== "undefined") {
        if (typeof message.attachment.media !== "undefined") {
            if (typeof message.attachment.media.image !== "undefined") {
                text = `${message.text}<img src="${message.attachment.media.image.src}">`;
            }
        }
    }
    return text
        .replace(
            /([^\s]*)/gi,
            function (m, key) {
                let result = data.filter(emote => {
                    return html_encode(emote.name) === key
                });
                if (typeof result[0] !== "undefined") {
                    let url = result[0]['urls'][1];
                    if (provider === "twitch") {
                        return `<img class="emote" " src="${url}"/>`;
                    } else {
                        if (typeof result[0].coords === "undefined") {
                            result[0].coords = {x: 0, y: 0};
                        }
                        let x = parseInt(result[0].coords.x);
                        let y = parseInt(result[0].coords.y);

                        let width = "{emoteSize}px";
                        let height = "auto";

                        if (provider === "mixer") {
                            console.log(result[0]);
                            if (result[0].coords.width) {
                                width = `${result[0].coords.width}px`;
                            }
                            if (result[0].coords.height) {
                                height = `${result[0].coords.height}px`;
                            }
                        }
                        return `<div class="emote" style="width: ${width}; height:${height}; display: inline-block; background-image: url(${url}); background-position: -${x}px -${y}px;"></div>`;
                    }
                } else return key;

            }
        );
}

function addMessage(data, message) {
    const color=data.displayColor || `#${md5(data.displayName).substr(26)}`;
    const badges= data.badges.reduce((acc, badge) => acc+`<img src="${badge.url}" class="badge">`, '')
    tchat.insertAdjacentHTML('beforeend', /*html*/`
    <div id="message_${data.msgId}" data-sender="${data.userId}" class="message-item" style="--color: ${color}">
        <div id="bar">
            <div id="button-red"></div>
            <div id="button-yellow"></div>
            <div id="button-green"></div>
            <div class="message-sender">
                <ion-icon name="send"  style="color: ${color}"></ion-icon>
                ${data.displayName}
            </div>
            <div class="badges">
                ${badges}
            </div>    
        </div>
        <div id="Message">
            <p class="Texte">${message}</p>
        </div>
    </div>`)
}
