# ✍️ EssayMaster

AI-powered essay analysis and feedback platform built with Next.js and OpenAI. Designed to help users enhance their writing with intelligent suggestions and feedback in real time.

---

## 🚀 Features

- ✨ GPT-4–powered essay feedback
- 📋 Real-time grammar and structure suggestions
- 🔐 Secure API key usage via environment variables
- 🧠 Customizable prompt system for tailored analysis
- 🛠️ Built with Next.js, Prisma, and TypeScript

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [OpenAI API](https://platform.openai.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [dotenv](https://www.npmjs.com/package/dotenv)

---

## 📦 Installation & Setup

### 1. **Clone the Repository**

git clone https://github.com/dajeti/EssayMaster.git
cd EssayMaster

First install NodeJS on your machine (you can do this via Homebrew if you are on Mac) then
follow the steps below.

2. Install Dependencies

cd essaymaster/src
npm install (might have to do this step in the root 'essaymaster' folder)
npx prisma generate

In a second terminal:

cd src/app
npm install
npm run dev


🧠 Environment Variables
Create a .env file in your project root and add the following:


# OpenAI

(You can find or generate one for a free trial here: https://platform.openai.com/settings/organization/api-keys)
OPENAI_API_KEY=your-openai-api-key

# MongoDB
MONGODB_URI=Developer_test:e55aymaster@cluster0.mongodb.net/essaymasterdb?retryWrites=true&w=majority
DATABASE_URL="mongodb+srv://Developer_test:e55aymaster@essaymasterdb.yzhv4.mongodb.net/essaymasterdb?retryWrites=true&w=majority"

# Auth
NEXTAUTH_SECRET="your-random-nextauth-secret"
NEXTAUTH_URL=http://localhost:3000

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
🔒 Never commit this file to version control. It’s already included in .gitignore.

# IMPORTANT - Your .env file should look like the one below (you have to add your own API key for the AI):

You can just copy and paste this under the essaymaster folder and fill in your own credentials as said above:

MONGODB_URI=Developer_test:e55aymaster@cluster0.mongodb.net/essaymasterdb?retryWrites=true&w=majority
DATABASE_URL="mongodb+srv://Developer_test:e55aymaster@essaymasterdb.yzhv4.mongodb.net/essaymasterdb?retryWrites=true&w=majority"
NEXTAUTH_SECRET="your-random-nextauth-secret"
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID="Ov23li6iRn0hPdEPkHOu"
GITHUB_CLIENT_SECRET="191fc0b2e25aad61f53da10dc7226a6642f6595b"
OPENAI_API_KEY=your-openai-api-key

📄 Usage
Once the app is running:

Navigate to http://localhost:3000

Register your login and navigate back to the login page to login with your new credentials

Once in the dashbaord, click on the 'Home' tab on the header.....

Paste or write an essay into the text area

Click the "Generate Feedback" button

Get instant feedback powered by GPT-4

📸 Screenshots
Coming soon...

🚧 Roadmap

 Make dashboard live

 Support for other languages

 Markscheme uploads to work against AI API

🤝 Contributing
Pull requests welcome! If you’d like to contribute:

Fork the repo

Create a feature branch (git checkout -b new-feature)

Commit your changes

Push to the branch

Open a PR

📬 Contact
For questions, feedback, or help:

Create an issue

Or reach out via GitHub discussions

📃 License
MIT © 2025 — dajeti
