const express = require("express");
const mongoose = require("mongoose");

const app = express();


var chats = [];

async function main() {
    log("Server starting...");
    await mongoose.connect("mongodb://127.0.0.1/assignment8", {
        useNewUrlParser: true
    });
    const chatSchema = new mongoose.Schema({
        time: Number,
        alias: String,
        message: String,
    });
    const Chat = mongoose.model("chat", chatSchema);

    log("MongoDB connected.");

    app.use(express.static("public_html"));

    app.get("/chats", async (req, res) => {
        log(`GET /chats [${req.ip}]`);
        let chats = await Chat.find();
        chats.sort((a, b) => a.time - b.time);
        res.json(chats);
    });

    app.post("/chats/post",
        express.json(),
        async (req, res) => {
            let { alias, message } = req.body;
            if (!alias || !message) {
                res.status(400).send("Bad Request");
                err(`Bad request: ${req.body}`)
                return;
            }
            let time = Date.now();
            try {
                await Chat({
                    time: time,
                    alias,
                    message
                }).save();
                res.status(200).send("OK");
                log(`Chat posted: ${alias} [${time.toLocaleString()}]: ${message}}`)
            } catch (err) {
                err(`Error saving chat: ${err}`);
                res.status(500).send("Internal Server Error");
            }
        });

    app.use((req, res) => {
        res.status(404).send("404 Not Found");
    });
    app.listen(80);
    log("Server started: http://localhost");
}

function log(msg) {
    console.log(`[${new Date().toLocaleString()}] | ${msg}`);
}

function err(msg) {
    console.error(`[${new Date().toLocaleString()}] | ${msg}`);
}

main().catch(err);