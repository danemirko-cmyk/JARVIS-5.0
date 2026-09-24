<div align="center">

# 🤖 J.A.R.V.I.S 5.0

### Advanced WhatsApp AI Bot for Termux

[![Version](https://img.shields.io/badge/version-5.0.0-blue?style=for-the-badge)](https://github.com/danemirko-cmyk/JARVIS-5.0)
[![Node.js](https://img.shields.io/badge/Node.js-24+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Bot-25D366?style=for-the-badge&logo=whatsapp)](https://www.whatsapp.com/)
[![Termux](https://img.shields.io/badge/Termux-Android-black?style=for-the-badge&logo=android)](https://termux.dev/)

</div>

---

<div align="center">

[📱 CONTATTO WHATSAPP](https://wa.me/393201391411)

[👥 GRUPPO WHATSAPP](https://chat.whatsapp.com/IYSTMuSoF796WRGBpfD3LB)

[📢 CANALE WHATSAPP](https://whatsapp.com/channel/0029VbDVGD53QxRvJ0PMnX0G)

[💻 GITHUB](https://github.com/danemirko-cmyk/JARVIS-5.0)

</div>

---

# ✨ COS'È J.A.R.V.I.S 5.0?

J.A.R.V.I.S 5.0 è un bot WhatsApp sviluppato per **Android, Termux e Node.js**.

Il progetto include strumenti di amministrazione dei gruppi, funzioni AI, giochi, profili, economia virtuale, moderazione automatica e diverse funzioni di utilità.

---

# 🚀 FUNZIONALITÀ

## 🤖 INTELLIGENZA ARTIFICIALE

- `.chat`
- `.meteo`
- `.news`
- `.play`
- `.testo`
- `.tts`
- `.blur`
- `.bonk`
- `.spiderman`

---

## 👤 PROFILO

- `.info`
- `.setig`
- `.classifica`
- `.classificabestemmie`

---

## 💰 ECONOMIA

- `.saldo`
- `.giornaliero`
- `.lavoro`
- `.ruba`
- `.paga`

---

## 🎮 DIVERTIMENTO

- `.dado`
- `.moneta`
- `.quiz`
- `.trivia`
- `.tris`
- `.sasso`
- `.wordle`
- `.indovinello`
- `.indovinaNumero`
- `.detective`
- `.slot`
- `.duello`
- `.giornata`
- `.8ball`
- `.gratta`

> `.gratta` è gratuito e assegna esclusivamente premi cosmetici. Non modifica i JCoins e non utilizza denaro reale.

---

## 👮 AMMINISTRAZIONE

- `.kick`
- `.warn`
- `.unwarn`
- `.muta`
- `.smuta`
- `.promuovi`
- `.degrada`
- `.admins`
- `.link`
- `.elimina`
- `.aperto`
- `.chiuso`
- `.hidetag`

---

## 🛡️ MODERAZIONE

- Protezione anti-link
- Sistema Control
- Rilevamento bestemmie
- Moderazione automatica
- Blocco temporaneo automatico
- Gestione degli utenti bloccati

### 🚫 BLOCK SYSTEM

- `.block`
- `.unblock`
- `.blocklist`

---

## 👑 OWNER

Funzioni riservate al proprietario:

- `.owner`
- `.proprietario`
- `.god`
- `.godmode`
- `.stats`
- `.backup`
- `.restart`
- `.shutdown`

---

# 🍴 FORK DEL PROGETTO

Puoi creare una tua copia di J.A.R.V.I.S 5.0 direttamente su GitHub.

### 1️⃣ Apri la repository

https://github.com/danemirko-cmyk/JARVIS-5.0

### 2️⃣ Premi `Fork`

Crea una copia della repository sul tuo account GitHub.

### 3️⃣ Clona il tuo Fork

Sostituisci `TUO-USERNAME` con il tuo username GitHub:

```bash
git clone https://github.com/TUO-USERNAME/JARVIS-5.0.git
```

### 4️⃣ Entra nella cartella

```bash
cd JARVIS-5.0
```

### 5️⃣ Installa le dipendenze

```bash
npm install
```

---

# 📱 INSTALLAZIONE SU TERMUX

J.A.R.V.I.S 5.0 è progettato principalmente per funzionare su Android tramite Termux.

## 📋 REQUISITI

- Android
- Termux
- Node.js 24+
- npm
- Git
- Connessione Internet
- WhatsApp
- Groq API Key

### Versione Node.js utilizzata durante lo sviluppo

```text
Node.js v24.18.0
```

---

## ⚡ INSTALLAZIONE

### 1️⃣ Aggiorna Termux

```bash
pkg update -y && pkg upgrade -y
```

### 2️⃣ Installa Git e Node.js

```bash
pkg install git nodejs -y
```

### 3️⃣ Controlla Node.js

```bash
node -v
```

Node.js deve essere almeno versione 24.

### 4️⃣ Clona J.A.R.V.I.S

```bash
git clone https://github.com/danemirko-cmyk/JARVIS-5.0.git
```

### 5️⃣ Entra nella cartella

```bash
cd JARVIS-5.0
```

### 6️⃣ Installa le dipendenze

```bash
npm install
```

---

# 🔑 GROQ API KEY

J.A.R.V.I.S utilizza Groq per le funzioni AI.

Apri:

https://console.groq.com/

Accedi al tuo account e crea una nuova API Key.

⚠️ **NON pubblicare mai la tua API Key su GitHub.**

---

# ⚙️ CONFIGURAZIONE

Crea il file `.env` copiando quello di esempio:

```bash
cp .env.example .env
```

Aprilo:

```bash
nano .env
```

Inserisci/configura:

```env
BOT_NAME=JARVIS 5.0
BOT_PREFIX=.

OWNER_NUMBER=39XXXXXXXXXX
OWNER_NAME=IlTuoNome

GROQ_API_KEY=LA_TUA_API_KEY
GROQ_MODEL=openai/gpt-oss-120b

SESSION_DIR=./auth_info
PRINT_QR=true

DATABASE_PATH=./jarvis.db

NODE_ENV=production

HOST=0.0.0.0
PORT=3000
```

---

# 👑 CONFIGURARE IL PROPRIETARIO

Nel file `.env` trova:

```env
OWNER_NUMBER=39XXXXXXXXXX
```

Inserisci il tuo numero WhatsApp in formato internazionale.

### Esempio

Numero:

```text
+39 320 1234567
```

diventa:

```env
OWNER_NUMBER=393201234567
```

Senza:

- `+`
- spazi
- parentesi
- trattini

Puoi modificare anche:

```env
OWNER_NAME=IlTuoNome
```

---

# 📲 COLLEGARE WHATSAPP

Dopo aver configurato il file `.env`, avvia J.A.R.V.I.S:

```bash
npm start
```

oppure:

```bash
node index.js
```

J.A.R.V.I.S mostrerà il QR Code nel terminale.

Sul telefono apri:

```text
WhatsApp
↓
Impostazioni
↓
Dispositivi collegati
↓
Collega un dispositivo
```

Scansiona il QR Code mostrato da Termux.

La sessione WhatsApp verrà salvata nella cartella:

```text
auth_info/
```

⚠️ Non condividere mai questa cartella e non caricarla su GitHub.

---

# 🔄 NUOVO QR CODE

Se devi effettuare nuovamente il collegamento WhatsApp:

```bash
rm -rf auth_info
```

Poi:

```bash
npm start
```

Verrà mostrato un nuovo QR Code.

⚠️ Questo elimina la sessione WhatsApp salvata.

---

# ▶️ AVVIARE J.A.R.V.I.S

```bash
npm start
```

oppure:

```bash
node index.js
```

---

# 🧪 CONTROLLO DEL PROGETTO

Prima di avviare J.A.R.V.I.S puoi controllare la sintassi:

```bash
npm run check
```

Se non vengono mostrati errori:

```bash
npm start
```

---

# 🟢 ATTIVAZIONE 24/7

Per mantenere il dispositivo attivo mentre J.A.R.V.I.S è in esecuzione puoi utilizzare:

```bash
termux-wake-lock
```

La disponibilità continua dipende comunque dalle impostazioni Android e dalla gestione della batteria.

---

# 🔐 SICUREZZA

Non pubblicare mai:

```text
.env
auth_info/
*.db
*.db-shm
*.db-wal
*.log
```

Non condividere:

- Groq API Key
- sessione WhatsApp
- token
- password
- credenziali personali

---

# 📢 COMMUNITY UFFICIALE

## 👥 GRUPPO WHATSAPP

https://chat.whatsapp.com/IYSTMuSoF796WRGBpfD3LB

## 📢 CANALE WHATSAPP

https://whatsapp.com/channel/0029VbDVGD53QxRvJ0PMnX0G

## 📱 CONTATTO

https://wa.me/393201391411

---

# ⭐ SUPPORTA IL PROGETTO

Se J.A.R.V.I.S ti piace:

⭐ Lascia una Star

🍴 Fai un Fork

🐛 Segnala i bug

💡 Proponi nuove funzioni

📢 Condividi il progetto

---

# 👨‍💻 SVILUPPATORE

**Dada (Mirko)**

J.A.R.V.I.S 5.0 è stato creato da Dada.

GitHub:

https://github.com/danemirko-cmyk

---

# ⚠️ DISCLAIMER

J.A.R.V.I.S è un progetto software indipendente.

WhatsApp è un marchio di Meta Platforms, Inc.

Il progetto non è affiliato, sponsorizzato o approvato da WhatsApp.

Utilizza il bot nel rispetto delle leggi applicabili e dei servizi utilizzati.

---

<div align="center">

# 🤖 J.A.R.V.I.S 5.0

### Your WhatsApp. Your Bot. Your Rules.

⭐ Grazie per aver scelto J.A.R.V.I.S!

</div>
