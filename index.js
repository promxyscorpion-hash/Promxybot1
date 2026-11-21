const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth')
    const sock = makeWASocket({ auth: state, printQRInTerminal: false })
    sock.ev.on('creds.update', saveCreds)

    if (!sock.authState.creds.registered) {
        // 👇 PUT YOUR SECOND WHATSAPP NUMBER HERE
        // Example: if number is 08123456789, put 2348123456789
        const phoneNumber = "2349163060217"
        const code = await sock.requestPairingCode(phoneNumber)
        console.log("YOUR PAIRING CODE IS: " + code)
        console.log("Go to WhatsApp > Linked Devices > Link with phone number, enter this code")
    }

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
