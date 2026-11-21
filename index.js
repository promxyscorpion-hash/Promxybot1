const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({ auth: state, printQRInTerminal: false })
    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update

        // If not registered, ask for pairing code AFTER connection opens
        if (connection === 'open') {
            console.log("Connected to WhatsApp!")
        }

        if (connection === 'close') {
            console.log("Connection closed, restarting...")
            startBot()
        }
    })

    // Wait 3 seconds for WhatsApp to be ready, then ask for code
    setTimeout(async () => {
        if (!sock.authState.creds.registered) {
            try {
                const phoneNumber = "2349163060217" // <-- PUT YOUR REAL NUMBER HERE AGAIN
                const code = await sock.requestPairingCode(phoneNumber)
                console.log("YOUR PAIRING CODE IS: " + code)
            } catch (e) {
                console.log("Failed to get code, retrying...", e.message)
            }
        }
    }, 3000)

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message || msg.key.fromMe) return
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
        const from = msg.key.remoteJid

        if (text === '.menu') {
            await sock.sendMessage(from, { text: `*🤖 PROMXY BOT MENU*\n\n.menu - Show this menu\n.hi - Say hello\n.joke - Tell a joke\n.price - Show price list\n.owner - Contact owner\n.ping - Check if bot is online` })
        }
        if (text === '.hi') {
            await sock.sendMessage(from, { text: 'Hello! 👋 Welcome to Promxy Bot. I am online 24/7' })
        }
        if (text === '.joke') {
            await sock.sendMessage(from, { text: 'Why did the chicken cross the road? To get to the other side! 😂' })
        }
        if (text === '.price') {
            await sock.sendMessage(from, { text: '*PROMXY PRICE LIST*\n\nData 1GB - ₦500\nAirtime - Available\nDM for more!' })
        }
        if (text === '.owner') {
            await sock.sendMessage(from, { text: 'Owner: Promxy - DM me!' })
        }
        if (text === '.ping') {
            await sock.sendMessage(from, { text: 'Pong! ✅ Promxy Bot is online' })
        }
    })
}
startBot()
