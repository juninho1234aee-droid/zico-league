import os
import json
from datetime import datetime
import telebot
from telebot import types
 
# ============ SOZLAMALAR ============
BOT_TOKEN = os.environ.get("BOT_TOKEN", "7995570383:AAFBTA9LWzgMjYvI37o6UxdjHrQZeleXxK8")
 
# Faqat shu 2 ID kirishi mumkin. Avval botni ishga tushiring,
# /myid buyrug'i bilan ID'laringizni oling, keyin shu yerga yozing.
ALLOWED_USERS = {
    111111111,  # <-- bu yerga O'ZINGIZNING ID'ingizni yozing
    222222222,  # <-- bu yerga @zico_efootball ning ID'sini yozing
}
 
PARTNER_USERNAME = "@zico_efootball"
DATA_FILE = "data.json"
 
bot = telebot.TeleBot(BOT_TOKEN)
user_state = {}  # chat_id -> "self" / "admin" / "obmen" / None
 
MONTHS_UZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
             "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"]
 
SELF_AMOUNTS = [5000, 10000, 15000]
ADMIN_AMOUNTS = [10000, 15000, 20000, 25000]
OBMEN_AMOUNTS = [15000, 20000, 25000]
 
 
# ============ MA'LUMOT BAZASI (oddiy JSON fayl) ============
def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)
 
 
def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
 
 
def is_allowed(user_id):
    return user_id in ALLOWED_USERS
 
 
def fmt(n):
    return f"{n:,}".replace(",", ".") + " so'm"
 
 
# ============ TUGMALAR ============
def main_menu():
    m = types.ReplyKeyboardMarkup(resize_keyboard=True)
    m.row("🔑 O'zi o'zgartiradi")
    m.row("🔧 Admin o'zgartiradi")
    m.row("🔁 Obmen")
    m.row("📊 Hisobot")
    return m
 
 
def amount_menu(options):
    m = types.ReplyKeyboardMarkup(resize_keyboard=True)
    row = []
    for o in options:
        row.append(fmt(o))
        if len(row) == 2:
            m.row(*row)
            row = []
    if row:
        m.row(*row)
    m.row("🔙 Orqaga")
    return m
 
 
# ============ BUYRUQLAR ============
@bot.message_handler(commands=["start"])
def start(message):
    if not is_allowed(message.from_user.id):
        bot.send_message(message.chat.id, "⛔ Sizga bu botdan foydalanishga ruxsat yo'q.")
        return
    user_state[message.chat.id] = None
    bot.send_message(
        message.chat.id,
        "Salom! Bu — garant hisob-kitob boti.\nHar bir ishni tugatgach, kerakli bo'limni tanlab, summani belgilang 👇",
        reply_markup=main_menu(),
    )
 
 
@bot.message_handler(commands=["myid"])
def myid(message):
    bot.send_message(message.chat.id, f"Sizning Telegram ID 1590570666 : {message.from_user.id}")
 
 
# ============ ASOSIY LOGIKA ============
@bot.message_handler(func=lambda m: True, content_types=["text"])
def handle_all(message):
    if not is_allowed(message.from_user.id):
        bot.send_message(message.chat.id, "⛔ Sizga bu botdan foydalanishga ruxsat yo'q.")
        return
 
    chat_id = message.chat.id
    text = message.text.strip()
 
    if text == "🔑 O'zi o'zgartiradi":
        user_state[chat_id] = "self"
        bot.send_message(chat_id, "Qancha ishladingiz?", reply_markup=amount_menu(SELF_AMOUNTS))
        return
 
    if text == "🔧 Admin o'zgartiradi":
        user_state[chat_id] = "admin"
        bot.send_message(
            chat_id,
            "Qancha ishladingiz?\n(Doplata bo'lgan bo'lsa, eng yuqori — 25.000 so'mni tanlang)",
            reply_markup=amount_menu(ADMIN_AMOUNTS),
        )
        return
 
    if text == "🔁 Obmen":
        user_state[chat_id] = "obmen"
        bot.send_message(chat_id, "Qancha ishladingiz?", reply_markup=amount_menu(OBMEN_AMOUNTS))
        return
 
    if text == "📊 Hisobot":
        show_report(chat_id)
        return
 
    if text == "🔙 Orqaga":
        user_state[chat_id] = None
        bot.send_message(chat_id, "Bosh menyu:", reply_markup=main_menu())
        return
 
    # Summa tanlanganda
    state = user_state.get(chat_id)
    if state in ("self", "admin", "obmen"):
        cleaned = text.replace("so'm", "").replace(".", "").replace(" ", "").strip()
        if cleaned.isdigit():
            amount = int(cleaned)
            data = load_data()
            data.append({
                "date": datetime.now().strftime("%Y-%m-%d"),
                "category": state,
                "amount": amount,
                "logged_by": message.from_user.id,
            })
            save_data(data)
            label = {"self": "O'zi o'zgartirdi", "admin": "Admin o'zgartirdi", "obmen": "Obmen"}[state]
            bot.send_message(
                chat_id,
                f"✅ Qabul qilindi: {fmt(amount)} — {label}",
                reply_markup=main_menu(),
            )
            user_state[chat_id] = None
            return
 
    bot.send_message(chat_id, "Iltimos, menyudan tanlang 👇", reply_markup=main_menu())
 
 
def show_report(chat_id):
    data = load_data()
    now = datetime.now()
    current_key = now.strftime("%Y-%m")
 
    monthly = {}
    for item in data:
        key = item["date"][:7]
        monthly.setdefault(key, []).append(item)
 
    if not monthly:
        bot.send_message(chat_id, "Hozircha hech qanday yozuv yo'q.", reply_markup=main_menu())
        return
 
    lines = ["📊 HISOBOT\n"]
    for key in sorted(monthly.keys()):
        year, month = key.split("-")
        month_name = MONTHS_UZ[int(month) - 1]
        items = monthly[key]
        total = sum(i["amount"] for i in items)
        half = total // 2
        marker = " 👈 hozirgi oy" if key == current_key else ""
        lines.append(f"— {month_name} {year}{marker}")
        lines.append(f"   Jami: {fmt(total)}")
        lines.append(f"   Sizga: {fmt(half)} | {PARTNER_USERNAME}: {fmt(total - half)}")
        lines.append(f"   Amallar soni: {len(items)}\n")
 
    bot.send_message(chat_id, "\n".join(lines), reply_markup=main_menu())
 
 
# ============ BOTNI ISHGA TUSHIRISH ============
if __name__ == "__main__":
    print("Bot ishga tushdi...")
    bot.infinity_polling()