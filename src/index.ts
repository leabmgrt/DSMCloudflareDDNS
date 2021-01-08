require('dotenv').config();
const express = require('express');
const app = express();
const axios = require('axios').default;

const cloudflareAPI = 'https://api.cloudflare.com/client/v4';

app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).json({ err: 'internalError' });
});
app.listen(process.env.PORT || 8080, () => console.log('Server ready.'));

app.get('/update', async (req, res) => {
	const { hostname, ip, zone, key } = req.query;
	if (
		typeof hostname !== 'string' ||
		typeof ip !== 'string' ||
		typeof zone !== 'string' ||
		typeof key !== 'string'
	)
		return res.status(400).json({ err: 'badRequest' });
	axios
		.get(
			`${cloudflareAPI}/zones/${zone}/dns_records?type=${process.env.RECORD_TYPE}&name=${hostname}`,
			{
				headers: {
					Authorization: `Bearer ${key}`,
					'Content-Type': 'application/json',
				},
			}
		)
		.then(async (response) => {
			updaterecord(response.data, hostname, ip, zone, key).then(
				(recordResponse) => {
					return res.send(recordResponse);
				}
			);
		})
		.catch(async (err) => {
			if (err.response.status == 400) {
				updaterecord(err.response.data, hostname, ip, zone, key).then(
					(recordResponse) => {
						console.log(recordResponse);
						return res.send(recordResponse);
					}
				);
			} else {
				console.log(err.response.status);
				return res.send('badauth');
			}
		});
});

const updaterecord = async (data, hostname, ip, zone, key): Promise<String> => {
	const recordid = ((data.result ?? [])[0] ?? {}).id ?? null;
	const currentIP = ((data.result ?? [])[0] ?? {}).content ?? '';

	if (currentIP == ip) return 'nochg';

	const dataToSend = {
		type: process.env.RECORD_TYPE,
		name: hostname,
		content: ip,
		ttl: 1,
		proxied: false,
	};

	if (recordid == null) {
		try {
			const creationResponse = await axios.post(
				`${cloudflareAPI}/zones/${zone}/dns_records`,
				dataToSend,
				{
					headers: {
						Authorization: `Bearer ${key}`,
						'Content-Type': 'application/json',
					},
				}
			);
			if (creationResponse.data.success === false) return 'badauth';
			return 'good';
		} catch (err) {
			console.log(err.response.data);
			return 'badauth';
		}
	} else {
		try {
			const updateresponse = await axios.put(
				`${cloudflareAPI}/zones/${zone}/dns_records/${recordid}`,
				dataToSend,
				{
					headers: {
						Authorization: `Bearer ${key}`,
						'Content-Type': 'application/json',
					},
				}
			);
			if (updateresponse.data.success === false) return 'badauth';
			return 'good';
		} catch {
			return 'badauth';
		}
	}
};

app.use((req, res) => {
	res.status(404).json({ err: 'notFound' });
});
