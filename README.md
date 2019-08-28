# 🥇 Golden Medal on StackOverflow

Want to look like a _pro_ on StackOverflow but you are too stupid to answer any difficult question so as to get enough upvotes?

Wanna do things the easy way? Cheating your way into _proness_?

You came into the right place

## ⏮️ Prerequisits
Set `Fanatic` medal on your StackOverflow account as the **next badge**

## 💫 ENV variables needed to run
| Name              | Meaning     |
| :------------------:| :-----------|
| USERNAME          | StackOverflow username|
| PASSWORD          | StackOverflow password|
| PHONE             | Phone number that has Whatsapp messenger. This number will receive a daily notification tracking the advancement of the medal|
| SO_USER           | StackOverflow profile link ex: `https://stackoverflow.com/users/3546086/happyhands31` should have value `/3546086/happyhands31` |
| WA_LOCAL_STORAGE  | Stringified version of local storage from `https://web.whatsapp.com` once you logged in through the QR|
| COOKIES           | Stringified version of cookies on StackOverflow and Whatsapp Web |
| USER_AGENT        | The user agent you'd like to use. I suggest you open your preferred browser and type on the console `navigator.userAgent` |

## ✨ What this runs
Project runs a web server with one endpoint: `/run`

This endpoint will access your StackOverflow account, and then send your progress through WhatsApp
