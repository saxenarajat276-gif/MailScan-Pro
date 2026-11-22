# MailScan Pro 🔐
### Email Breach Detection & Exposure Intelligence Platform

MailScan Pro is a web-based cybersecurity project that helps users check whether their email addresses appear in known data breach records.

It uses the **XposedOrNot API** to retrieve known breach associations and displays the results through a modern security dashboard.

## 🚀 Features

- **Email Breach Detection:** Check email addresses against known breach records.
- **Platform Identification:** Display platform names associated with detected breaches.
- **Security Dashboard:** View breach statistics and scan results.
- **Risk Information:** Display risk assessment status where supported by available data.
- **Responsive Interface:** Modern interface compatible with desktop and mobile devices.
- **Privacy-Conscious Design:** Email scanning requests are processed through the backend.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | UI design and styling |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | Backend framework |
| XposedOrNot API | Breach data provider |

## 📂 Project Structure

```text
MailScan-Pro/
│
├── public/
│   └── index.html
│
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/saxenarajat276-gif/MailScan-Pro.git
```

### 2. Navigate to Project Directory

```bash
cd MailScan-Pro
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Application

```bash
npm start
```

### 5. Open in Browser

Visit:

```text
http://localhost:3000
```

## 🔍 How It Works

1. User enters an email address.
2. The frontend sends a request to the Express backend.
3. The backend validates the email address.
4. The backend communicates with the XposedOrNot API.
5. Available breach associations are extracted.
6. Results are returned to the frontend.
7. MailScan Pro displays the associated platform names and available information.

## 🔒 Privacy & Security

- Email validation is performed on the backend.
- API requests are handled server-side.
- Environment files and dependencies are excluded from Git.
- The application does not require users to provide their account passwords.

## ⚠️ Important Disclaimer

MailScan Pro identifies known breach associations returned by XposedOrNot.

A detected platform does not prove that an account is currently active on that platform.

The application cannot identify every website where an email address is registered.

The basic API endpoint does not necessarily provide detailed exposure types, breach dates, or affected-record counts.

## 🔮 Future Enhancements

- Downloadable PDF security reports.
- Detailed breach information.
- Enhanced security recommendations.
- Multi-provider breach data integration.
- Advanced account security assistance.

## 👨‍💻 Developer

**Rajat Saxena**

BCA Student  
Uttaranchal University

## 📡 Data Provider

[XposedOrNot](https://xposedornot.com/)

---

**MailScan Pro – Know Your Exposure. Protect Your Identity.**
