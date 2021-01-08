# DSMCloudflareDDNS

An API to forward Synology DMS DDNS requests to Cloudflare

## Why?

Synology DMS (Diskstation Manager) has a built-in DDNS system, so it'll update the DNS records automatically (using the devices' external IP).
There are some service providers already in DMS but Cloudflare isn't one of them. DMS sends GET requests with all informations as query parameters (?hostname=...&key=...) but Cloudflare uses POST and PUT requests to create and update DNS records. The data is in the body and not in the query parameters.

This API converts the DSM request to a Cloudflare request. It first checks whether a record with the specified hostname already exists, if so it'll check if the IP changed and update the record. If no record exists it'll create one.

The TTL is set to "Auto" and it won't enable Cloudflare Proxy.

## How to use

1. Setup the NodeJS application
   - 1.1 (Preferred). Clone this repo and let it run somewhere, on a server or your NAS directly (I didn't test that though). !! Important: Rename .env.example to .env. There you can change the environment variables !!
   - 1.2. As of time of writing this, I have an instance of the program running on my own server at `dsmddnscloudflare.abmgrt.dev`. If you can't setup an own instance of the application, you can use this domain in the next step. But remember that I can change the domain or shut down this instance at any time. **By using this instance that this domain you agree that you are responsible for any type of damage. While unlikely, you're still sharing your Cloudflare API Token with my server.**

2. In DSM, go to "Control Panel" -> "External Access" -> "DDNS" and click "Customize Provider". Set the Name to Cloudflare and the Query URL to the following string:

`https://dns.your.domain/update?hostname=__HOSTNAME__&ip=__MYIP__&zone=__USERNAME__&key=__PASSWORD__`

3. Replace `dns.your.domain` with the domain or IP address to the running NodeJS application. (Words surrounded by "\_\_" are variables by DSM, **DO NOT CHANGE THEM UNLESS YOU KNOW WHAT YOU'RE DOING**)
4. Click "Save"
5. In the upper-left corner, click "add" and select "\*Cloudflare"
6. Set "Hostname" to the hostname you want to update
7. Go to the Cloudflare Dashboard and select your domain. On the left (under "API") copy the Zone ID.
8. Go back to DSM and paste the Zone ID at "Username/Email"
9. Go to "https://dash.cloudflare.com/profile/api-tokens" and create a token. You can use the "Edit Zone DNS" template. Under "Zone Resources" add all zones you want to edit. Follow the instructions on screen until you get the token. Copy this token.
10. Go back to DSM and paste the token under "Password/Key"
11. Click "OK"
12. Done 🎉

## Environment Variables

- "RECORD_TYPE": "A" (IPv4) or "AAAA" (IPv6)
- "PORT": The port on which the application is running on (8080 if not specified)

## Contributing

If you find a bug or if you want to improve the application feel free to create a PR! Note: This is a simple application with its only task being to forward requests from DSM to Cloudflare. Please don't add more functionality that's not relevant for that task.

## Questions

If you have any questions, feel free to contact me on [Twitter](https://twitter.com/leabmgrt2), [E-Mail](mailto:lea@abmgrt.dev) or open an issue.

## License

This project is licensed under the MIT license. Please take a look at ["LICENSE"](LICENSE) for more information.
