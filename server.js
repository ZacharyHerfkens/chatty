const express = require("express");
const mongoose = require("mongoose");

const app = express();

class Server {
    static async init() {
        let server = new Server();
        await server._start();
        return server;
    }

    async _start() {
        log("Starting server...");
        await mongoose.connect("mongodb://127.0.0.1/chatty");
        const chatSchema = new mongoose.Schema({
            time: Number,
            alias: String,
            message: String
        });
        this.Chat = mongoose.model("chat", chatSchema);
        log("MongoDB initialized.");

        this.app = express();
        this.app.use(express.static("public_html"));
        this.app.use(express.json());

        this.app.get("/chats", this._getChats.bind(this));
        this.app.post("/chats/post", this._postChat.bind(this));
        this.app.use(this._notFound.bind(this));

        this.app.listen(80);
        log("Server started: http://localhost");
    }

    async _getChats(req, res) {
        log(`GET /chats [${req.ip}]`);
        let chats = await this.Chat.find();
        chats.sort((a, b) => a.time - b.time);
        res.json(chats);
    }

    async _postChat(req, res) {
        let { alias, message } = req.body;
        if (!alias || !message) {
            res.status(400).send("Bad Request");
            err(`Bad request: ${req.body}`)
            return;
        }
        let time = Date.now();
        try {
            await this.Chat({
                time: time,
                alias,
                message
            }).save();
            res.status(200).send("OK");
            log(`Chat posted: ${alias} [${new Date(time).toLocaleString()}]: ${message}`)
        } catch (err) {
            err(`Error saving chat: ${err}`);
            res.status(500).send("Internal Server Error");
        }
    }

    _notFound(req, res) {
        res.status(404).send("404 Not Found");
    }
}

function log(msg) {
    console.log(`[${new Date().toLocaleString()}] | ${msg}`);
}

function err(msg) {
    console.error(`[${new Date().toLocaleString()}] | ${msg}`);
}

Server.init();