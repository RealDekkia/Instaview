const instaView = {
    curUserName: undefined,
    getJsonFile: function (fileName, callback) {
        var request1 = new XMLHttpRequest();
        request1.open("GET", window.location.href + "getjson");
        //request1.setRequestHeader('Content-type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request1.setRequestHeader("name", fileName);

        request1.addEventListener('load', function () {
            if (request1.status >= 200 && request1.status < 300) {
                callback(request1.responseText);
            } else {
                console.warn("request-serverError: " + request1.status + " " + request1.statusText + ": " + request1.responseText);
                callback(false);
            }
        });
        request1.addEventListener('error', function () {
            console.warn("request-clientError: " + request1.status + " " + request1.statusText + ": " + request1.responseText);
            callback(false);
        });
        request1.addEventListener('abort', function () {
            console.warn("request-abort: " + request1.status + " " + request1.statusText + ": " + request1.responseText);
            callback(false);
        });
        request1.send();

    },
    start: function () {
        instaView.profile(function () {
            instaView.chatMessages();
            instaView.accountHistory();
            instaView.comments();
            instaView.connections();
            instaView.devices();
            instaView.likes();
            instaView.media();
            instaView.seen_content();
            instaView.story_activities();
        });
    },
    profile: function (callback) {
        instaView.getJsonFile("profile", function (str) {
            var profileInfo = JSON.parse(str);
            instaView.curUserName = profileInfo.username;

            document.getElementById("topBoxText1").innerHTML += profileInfo.name;
            document.getElementById("topBoxText1").innerHTML += "<br>Username:" + profileInfo.username;
            document.getElementById("topBoxText1").innerHTML += "<br>Email: " + profileInfo.email;
            document.getElementById("topBoxText2").innerHTML += "Joined: " + new Date(profileInfo.date_joined).toLocaleDateString() + ", " + new Date(profileInfo.date_joined).toLocaleTimeString();
            document.getElementById("topBoxText2").innerHTML += "<br>Gender: " + profileInfo.gender;
            document.getElementById("topBoxText2").innerHTML += "<br>Private Account: " + profileInfo.private_account;
            document.getElementById("topBoxImage").src = profileInfo.profile_pic_url;

            callback();
        });
    },
    chatMessages: function () {
        instaView.getJsonFile("messages", function (str) {
            var messages = JSON.parse(str);
            var msgList = document.getElementById("messageBox");

            messages.forEach(function (msg, index) {
                //console.log(msg);

                var msgBoxItem = document.createElement("div");
                msgBoxItem.className = "blackAndWhiteTable";
                msgBoxItem.innerHTML = jdenticon.toSvg(msg.participants.toString(), 40);

                var msgBoxTxt = document.createElement("p");
                var usrList = "";
                msg.participants.forEach(part => {
                    if (part != instaView.curUserName) {
                        msgBoxTxt.innerHTML += part + " ";
                        usrList += part + " ";
                    }
                });
                msgBoxItem.appendChild(msgBoxTxt);

                msgBoxItem.setAttribute("convId", index);
                msgList.appendChild(msgBoxItem);

                msgBoxItem.onclick = function () {
                    var conversations = messages[this.getAttribute("convId")].conversation;
                    conversations.sort(function (a, b) {
                        return new Date(a.created_at) - new Date(b.created_at);
                    });

                    var chatHistoryScrollArea = document.getElementById("chatHistoryScrollArea");
                    var chatHistory = document.getElementById("chatHistory");
                    chatHistoryScrollArea.innerHTML = "";

                    conversations.forEach(function (conv) {
                        var bubble = document.createElement("div");

                        var bubbleText = document.createElement("div");
                        bubble.appendChild(bubbleText);

                        var bubbleDateString = document.createElement("div");
                        bubbleDateString.className = "bubbleDateString";
                        bubble.appendChild(bubbleDateString);

                        bubbleDateString.innerHTML = new Date(conv.created_at).toLocaleDateString() + ", " + new Date(conv.created_at).toLocaleTimeString();

                        if (conv.text) {
                            bubbleText.innerHTML = conv.text;
                        } else if (conv.media_share_caption) {
                            bubbleText.innerHTML = "Shared Media from '" + conv.media_owner;
                            if (conv.media_share_url.toLowerCase().replace(/( |\.)/g, '') != "mediashareunavailable") {
                                bubbleText.innerHTML += "' <br> <img class='mediaImage' src='" + conv.media_share_url + "' title='" + conv.media_share_caption + "' alt='Could not load Media.'>";
                            }
                        }
                        else if (conv.story_share) {
                            bubbleText.innerHTML = conv.story_share;
                        } else if (typeof conv.live_video_invite == "string") {
                            if (conv.live_video_invite) {
                                bubbleText.innerHTML = conv.live_video_invit;
                            } else {
                                bubbleText.innerHTML = "Live video invite";
                            }
                        }
                        else {
                            bubbleText.innerHTML = "Unknown message type";
                            console.log(conv);
                        }

                        if (conv.sender != instaView.curUserName) {
                            bubble.className = "chatbubble otherbubble";
                        } else {
                            bubble.className = "chatbubble mybubble";
                        }

                        chatHistoryScrollArea.appendChild(bubble);
                    })

                    var chatHistoryHeader = document.getElementById("chatHistoryHeader");
                    chatHistoryHeader.innerHTML = "";


                    var chatHistoryBackButton = document.createElement("p");
                    chatHistoryBackButton.innerHTML = "🔙";
                    chatHistoryBackButton.className = "chatHistoryBackButton";
                    chatHistoryHeader.appendChild(chatHistoryBackButton);
                    chatHistoryBackButton.onclick = function () {
                        chatHistory.style.display = "none";
                        msgList.style.display = "block";
                    }

                    //chatHistoryHeader.innerHTML += jdenticon.toSvg(msg.participants.toString(), 40);

                    var chatHistoryHeaderText = document.createElement("p");
                    chatHistoryHeaderText.innerHTML = usrList;
                    chatHistoryHeader.appendChild(chatHistoryHeaderText);

                    chatHistory.style.display = "block";
                    msgList.style.display = "none";
                }
            });
        });
    },
    accountHistory: function () {
        instaView.getJsonFile("account_history", function (str) {
            var history = JSON.parse(str);

            history.login_history.sort(function (a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            var loginInfoContainer = document.getElementById("loginInfoContainer");

            var loginInfoScrolllist = document.getElementById("loginInfoScrolllist");
            loginInfoScrolllist.innerHTML = "";

            history.login_history.forEach(function (loginAction) {
                var loginInfoBox = document.createElement("div");
                loginInfoBox.className = "loginInfoBox blackAndWhiteTable";

                var loginInfoDate = document.createElement("div");
                loginInfoDate.className = "loginInfoDate";
                loginInfoDate.innerHTML = new Date(loginAction.timestamp).toLocaleDateString() + "<br>" + new Date(loginAction.timestamp).toLocaleTimeString();
                loginInfoBox.appendChild(loginInfoDate);

                var loginInfoIp = document.createElement("div");
                loginInfoIp.className = "loginInfoIp";
                loginInfoIp.innerHTML = "IP: " + loginAction.ip_address;
                loginInfoBox.appendChild(loginInfoIp);

                var loginInfoCookie = document.createElement("div");
                loginInfoCookie.className = "loginInfoCookie";
                loginInfoCookie.innerHTML = "Cookie: [...]" + loginAction.cookie_name.replace(/\*/g, '');
                loginInfoBox.appendChild(loginInfoCookie);

                var loginInfoDevice = document.createElement("div");
                loginInfoDevice.className = "loginInfoDevice";
                loginInfoDevice.innerHTML = "Device-ID: " + loginAction.device_id;
                loginInfoBox.appendChild(loginInfoDevice);

                var loginInfoLanguage = document.createElement("div");
                loginInfoLanguage.className = "loginInfoLanguage";
                loginInfoLanguage.innerHTML = "Language: " + loginAction.language_code;
                loginInfoBox.appendChild(loginInfoLanguage);

                var loginInfoAgent = document.createElement("div");
                loginInfoAgent.className = "loginInfoAgent";
                loginInfoAgent.innerHTML = loginAction.user_agent;
                loginInfoBox.appendChild(loginInfoAgent);



                loginInfoScrolllist.appendChild(loginInfoBox);
            });

        });
    },
    comments: function () {
        instaView.getJsonFile("comments", function (str) {
            var comments = JSON.parse(str);

            console.log(comments);


            var commentScrollbox = document.getElementById("commentScrollbox");
            comments.media_comments.forEach(function (seen) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable commentScrollboxItem";

                var usrName = document.createElement("div");
                usrName.innerHTML = seen[2];
                line.appendChild(usrName);

                var date = document.createElement("div");
                date.innerHTML = new Date(seen[0]).toLocaleDateString() + ", " + new Date(seen[0]).toLocaleTimeString();
                line.appendChild(date);

                var comment = document.createElement("div");
                comment.innerHTML = seen[1];
                line.appendChild(comment);


                commentScrollbox.appendChild(line);
            });
        });
    },
    connections: function () {
        instaView.getJsonFile("connections", function (str) {
            var connections = JSON.parse(str);

            var blockedUserScrollbox = document.getElementById("blockedUserScrollbox");
            for (var usr in connections.blocked_users) {

                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = usr;
                line.appendChild(usrName);

                var blockDate = document.createElement("div");
                blockDate.innerHTML = new Date(connections.blocked_users[usr]).toLocaleDateString() + ", " + new Date(connections.blocked_users[usr]).toLocaleTimeString();
                line.appendChild(blockDate);

                blockedUserScrollbox.appendChild(line);
            }

            var dismissedUserScrollbox = document.getElementById("dismissedUserScrollbox");
            for (var usr in connections.dismissed_suggested_users) {

                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = usr;
                line.appendChild(usrName);

                var blockDate = document.createElement("div");
                blockDate.innerHTML = new Date(connections.dismissed_suggested_users[usr]).toLocaleDateString() + ", " + new Date(connections.dismissed_suggested_users[usr]).toLocaleTimeString();
                line.appendChild(blockDate);

                dismissedUserScrollbox.appendChild(line);
            }

            var followerScrollbox = document.getElementById("followerScrollbox");
            for (var usr in connections.followers) {

                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = usr;
                line.appendChild(usrName);

                var blockDate = document.createElement("div");
                blockDate.innerHTML = new Date(connections.followers[usr]).toLocaleDateString() + ", " + new Date(connections.followers[usr]).toLocaleTimeString();
                line.appendChild(blockDate);

                followerScrollbox.appendChild(line);
            }

            var followingScrollbox = document.getElementById("followingScrollbox");
            for (var usr in connections.following) {

                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = usr;
                line.appendChild(usrName);

                var blockDate = document.createElement("div");
                blockDate.innerHTML = new Date(connections.following[usr]).toLocaleDateString() + ", " + new Date(connections.following[usr]).toLocaleTimeString();
                line.appendChild(blockDate);

                followingScrollbox.appendChild(line);
            }

            var permFollowRequesScrollbox = document.getElementById("permFollowRequesScrollbox");
            for (var usr in connections.permanent_follow_requests) {

                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = usr;
                line.appendChild(usrName);

                var blockDate = document.createElement("div");
                blockDate.innerHTML = new Date(connections.permanent_follow_requests[usr]).toLocaleDateString() + ", " + new Date(connections.permanent_follow_requests[usr]).toLocaleTimeString();
                line.appendChild(blockDate);

                permFollowRequesScrollbox.appendChild(line);
            }
        });
    },
    devices: function () {
        instaView.getJsonFile("devices", function (str) {
            var devices = JSON.parse(str);

            var deviceScrollBox = document.getElementById("deviceScrollBox");
            devices.devices.forEach(function (dev) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable deviceListItem";

                var deviceId = document.createElement("div");
                deviceId.innerHTML = dev.device_id;
                deviceId.className = "deviceListItemId";
                line.appendChild(deviceId);

                var lastSeen = document.createElement("div");
                lastSeen.innerHTML = "Last Seen: " + new Date(dev.last_seen).toLocaleDateString() + ", " + new Date(dev.last_seen).toLocaleTimeString();
                lastSeen.className = "deviceListItemLastSeen";
                line.appendChild(lastSeen);

                var userAgent = document.createElement("div");
                userAgent.innerHTML = dev.user_agent;
                userAgent.className = "deviceListItemUserAgent";
                line.appendChild(userAgent);

                deviceScrollBox.appendChild(line);
            });

        });
    },
    likes: function () {
        instaView.getJsonFile("likes", function (str) {
            var likes = JSON.parse(str);

            var commentLikesScrollbox = document.getElementById("commentLikesScrollbox");
            likes.comment_likes.forEach(function (like) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = like[1];
                line.appendChild(usrName);

                var dateLine = document.createElement("div");
                dateLine.innerHTML = new Date(like[0]).toLocaleDateString() + ", " + new Date(like[0]).toLocaleTimeString();
                line.appendChild(dateLine);

                commentLikesScrollbox.appendChild(line);
            });

            var mediaLikesScrollbox = document.getElementById("mediaLikesScrollbox");
            likes.media_likes.forEach(function (like) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = like[1];
                line.appendChild(usrName);

                var dateLine = document.createElement("div");
                dateLine.innerHTML = new Date(like[0]).toLocaleDateString() + ", " + new Date(like[0]).toLocaleTimeString();
                line.appendChild(dateLine);

                mediaLikesScrollbox.appendChild(line);
            });
        });
    },
    media: function () {
        instaView.getJsonFile("media", function (str) {
            var media = JSON.parse(str);

            media.photos.sort(function (a, b) {
                return new Date(b.taken_at) - new Date(a.taken_at);
            });

            var photoContainerGrid = document.getElementById("photoContainerGrid");
            media.photos.forEach(function (ph) {
                var photoSquare = document.createElement("div");
                photoSquare.className = "photoContainerSquare";
                photoSquare.style.backgroundImage = "url('/" + ph.path + "')";
                photoSquare.title = ph.caption;
                photoContainerGrid.appendChild(photoSquare);

                photoSquare.onclick = function () {
                    var photoContainerBigBox = document.getElementById("photoContainerBigBox");
                    var photoContainerBigBoxHeadline = document.getElementById("photoContainerBigBoxHeadline");
                    photoContainerBigBoxHeadline.innerHTML = "";

                    var backButton = document.createElement("div");
                    backButton.innerHTML = "🔙";
                    backButton.className = "backButton";
                    photoContainerBigBoxHeadline.appendChild(backButton);
                    backButton.onclick = function () {
                        photoContainerBigBox.style.display = "none";
                        photoContainerGrid.style.display = "grid";
                    }

                    var headText = document.createElement("p");
                    headText.innerHTML = ph.caption;
                    photoContainerBigBoxHeadline.appendChild(headText);

                    var photoContainerBigBoxPhoto = document.getElementById("photoContainerBigBoxPhoto");
                    photoContainerBigBoxPhoto.style.backgroundImage = "url('/" + ph.path + "')";

                    var photoContainerBigBoxLocation = document.getElementById("photoContainerBigBoxLocation");
                    photoContainerBigBoxLocation.innerHTML = "Location: " + ph.location;

                    var photoContainerBigBoxDate = document.getElementById("photoContainerBigBoxDate");
                    photoContainerBigBoxDate.innerHTML = "Posted At: " + new Date(ph.taken_at).toLocaleDateString() + ", " + new Date(ph.taken_at).toLocaleTimeString();

                    photoContainerBigBox.style.display = "block";
                    photoContainerGrid.style.display = "none";
                }
            })

            var storyContainerGrid = document.getElementById("storyContainerGrid");
            media.stories.forEach(function (st) {
                var photoSquare = document.createElement("div");
                photoSquare.className = "storyContainerSquare";
                photoSquare.style.backgroundImage = "url('/" + st.path + "')";
                photoSquare.title = st.caption;
                storyContainerGrid.appendChild(photoSquare);

                photoSquare.onclick = function () {
                    var storyContainerBigBox = document.getElementById("storyContainerBigBox");

                    var storyContainerBigBoxHeadline = document.getElementById("storyContainerBigBoxHeadline");
                    storyContainerBigBoxHeadline.innerHTML = "";

                    var backButton = document.createElement("div");
                    backButton.innerHTML = "🔙";
                    backButton.className = "backButton";
                    storyContainerBigBoxHeadline.appendChild(backButton);
                    backButton.onclick = function () {
                        storyContainerBigBox.style.display = "none";
                        storyContainerGrid.style.display = "grid";
                    }

                    var headText = document.createElement("p");
                    headText.innerHTML = st.caption;
                    storyContainerBigBoxHeadline.appendChild(headText);

                    var storyContainerBigBoxPhoto = document.getElementById("storyContainerBigBoxPhoto");
                    storyContainerBigBoxPhoto.style.backgroundImage = "url('/" + st.path + "')";

                    var storyContainerBigBoxDate = document.getElementById("storyContainerBigBoxDate");
                    storyContainerBigBoxDate.innerHTML = "Posted At: " + new Date(st.taken_at).toLocaleDateString() + ", " + new Date(st.taken_at).toLocaleTimeString();

                    storyContainerBigBox.style.display = "block";
                    storyContainerGrid.style.display = "none";
                }
            })
        });

    },
    seen_content: function () {
        instaView.getJsonFile("seen_content", function (str) {
            var seen = JSON.parse(str);

            var seenAdsScrollbox = document.getElementById("seenAdsScrollbox");
            seen.ads_seen.forEach(function (ad) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = ad.author;
                line.appendChild(usrName);

                var date = document.createElement("div");
                date.innerHTML = new Date(ad.timestamp).toLocaleDateString() + ", " + new Date(ad.timestamp).toLocaleTimeString();
                line.appendChild(date);

                seenAdsScrollbox.appendChild(line);
            });

            var chainingSeenScrollbox = document.getElementById("chainingSeenScrollbox");
            seen.chaining_seen.forEach(function (seen) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = seen.username;
                line.appendChild(usrName);

                var date = document.createElement("div");
                date.innerHTML = new Date(seen.timestamp).toLocaleDateString() + ", " + new Date(seen.timestamp).toLocaleTimeString();
                line.appendChild(date);

                chainingSeenScrollbox.appendChild(line);
            });

            var postsSeenScrollbox = document.getElementById("postsSeenScrollbox");
            seen.posts_seen.forEach(function (seen) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = seen.author;
                line.appendChild(usrName);

                var date = document.createElement("div");
                date.innerHTML = new Date(seen.timestamp).toLocaleDateString() + ", " + new Date(seen.timestamp).toLocaleTimeString();
                line.appendChild(date);

                postsSeenScrollbox.appendChild(line);
            });

            var videosSeenScrollbox = document.getElementById("videosSeenScrollbox");
            seen.videos_watched.forEach(function (seen) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = seen.author;
                line.appendChild(usrName);

                var date = document.createElement("div");
                date.innerHTML = new Date(seen.timestamp).toLocaleDateString() + ", " + new Date(seen.timestamp).toLocaleTimeString();
                line.appendChild(date);

                videosSeenScrollbox.appendChild(line);
            });
        });
    },
    story_activities: function () {
        instaView.getJsonFile("stories_activities", function (str) {
            var act = JSON.parse(str);

            var storyActivitesScrollbox = document.getElementById("storyActivitesScrollbox");
            act.countdowns.forEach(function (seen) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = "countdown " + seen[1];
                line.appendChild(usrName);

                var date = document.createElement("div");
                date.innerHTML = new Date(seen[0]).toLocaleDateString() + ", " + new Date(seen[0]).toLocaleTimeString();
                line.appendChild(date);

                storyActivitesScrollbox.appendChild(line);
            });
            act.polls.forEach(function (seen) {
                var line = document.createElement("div");
                line.className = "blackAndWhiteTable";

                var usrName = document.createElement("div");
                usrName.innerHTML = "poll " + seen[1];
                line.appendChild(usrName);

                var date = document.createElement("div");
                date.innerHTML = new Date(seen[0]).toLocaleDateString() + ", " + new Date(seen[0]).toLocaleTimeString();
                line.appendChild(date);

                storyActivitesScrollbox.appendChild(line);
            });
        });
    }
};

instaView.start();