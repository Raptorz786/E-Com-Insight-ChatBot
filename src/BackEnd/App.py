from flask import Flask, request, jsonify
from flask_cors import CORS
from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
import random
from EComData import ecommerce_training_data, update_history, conversation_history

app = Flask(__name__)
CORS(app)

# ---------------- LOGIN ROUTE ----------------
USER = {
    "email": "farrukhshah1020@gmail.com",
    "password": "1122"
}

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if email == USER["email"] and password == USER["password"]:
        greeting = {
            "response": f"Hi Farrukh! 👋 Welcome back! How’s your day going?",
            "next_step": "awaiting_positive_reply"
        }
        return jsonify({"success": True, "message": "Login successful!", "bot_greeting": greeting})
    else:
        return jsonify({"success": False, "message": "Invalid credentials"}), 401


# ------------------------------------------------------------
# Initialize ChatterBot
bot = ChatBot(
    "MyChatBot",
    storage_adapter="chatterbot.storage.SQLStorageAdapter",
    database_uri="sqlite:///database.sqlite3"
)
trainer = ListTrainer(bot)

# Basic greetings
greeting_pairs = [
    ["hi", "Hello! How can I help you today?"],
    ["hello", "Hi there! What would you like to know about Pakistan’s eCommerce industry?"],
    ["hey", "Hey! How’s it going?"],
]
for pair in greeting_pairs:
    trainer.train(pair)

# Train safely on provided dataset
for topic in ecommerce_training_data:
    if "questions" in topic and "answers" in topic:
        for q, a in zip(topic["questions"], topic["answers"].values()):
            trainer.train([q, a])


# ------------------------------------------------------------
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "").strip().lower()
    user_name = "User1"

    if not user_message:
        return jsonify({"response": "Please type a message."})

    greetings = ["hi", "hello", "hey", "salam", "hi there", "good morning", "good evening"]
    positive_responses = ["good", "great", "fine", "awesome", "nice", "alhamdulillah", "perfect", "fantastic"]

    # 1️⃣ Greeting detected → show random 3 questions
    if any(word in user_message for word in greetings):
        all_questions = [q for topic in ecommerce_training_data for q in topic["questions"]]
        random_questions = random.sample(all_questions, 3)
        return jsonify({
            "response": "What would you like to know?",
            "options": [{"id": i + 1, "question": q} for i, q in enumerate(random_questions)]
        })

    # 2️⃣ Positive reply detected → suggest 3 random topics
    if any(word in user_message for word in positive_responses):
        all_questions = [q for topic in ecommerce_training_data for q in topic["questions"]]
        random_questions = random.sample(all_questions, 3)
        return jsonify({
            "response": "Glad to hear that! 😊 Here are a few topics you might be interested in:",
            "options": [{"id": i + 1, "question": q} for i, q in enumerate(random_questions)]
        })

    # 3️⃣ If user clicked a question → return exact matching answer + follow-ups
    for topic in ecommerce_training_data:
        if "questions" in topic and "answers" in topic:
            for idx, q in enumerate(topic["questions"]):
                if user_message.lower() == q.lower():
                    ans_keys = list(topic["answers"].keys())
                    if idx < len(ans_keys):
                        answer_key = ans_keys[idx]
                        answer = topic["answers"][answer_key]
                    else:
                        answer = random.choice(list(topic["answers"].values()))

                    update_history(user_name, q, answer)

                    # --- FIXED FOLLOW-UP LOGIC ---
                    follow_ups = topic.get("follow_ups", [])
                    if not follow_ups:
                        # use 3 random questions from all topics if no follow_ups exist
                        all_questions = [
                            ques for t in ecommerce_training_data
                            for ques in t.get("questions", [])
                            if ques.lower() != q.lower()
                        ]
                        follow_ups = random.sample(all_questions, min(3, len(all_questions)))

                    return jsonify({
                        "response": answer,
                        "options": [{"id": i + 1, "question": fq} for i, fq in enumerate(follow_ups)]
                    })

    # 4️⃣ Otherwise → fallback to chatterbot
    bot_reply = str(bot.get_response(user_message))
    update_history(user_name, user_message, bot_reply)
    return jsonify({"response": bot_reply})


# ------------------------------------------------------------
@app.route("/history", methods=["GET"])
def history():
    return jsonify(conversation_history)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
