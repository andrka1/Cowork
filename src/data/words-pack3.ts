import { Word } from "./types";

// Компактный формат: en|ru|category|level (по одному слову в строке).
// Озвучка генерируется автоматически на сборке (scripts/gen-audio.mjs сканирует поле en).
// Строки, начинающиеся с #, и пустые строки игнорируются.
let _id = 20000;

const RAW = `
# --- Core nouns ---
thing|вещь|basics|A1
place|место|basics|A1
world|мир|basics|A1
life|жизнь|basics|A1
day|день|time|A1
night|ночь|time|A1
week|неделя|time|A1
month|месяц|time|A1
year|год|time|A1
hour|час|time|A1
minute|минута|time|A1
moment|момент|time|A2
name|имя|basics|A1
word|слово|basics|A1
question|вопрос|basics|A1
answer|ответ|basics|A1
problem|проблема|basics|A2
idea|идея|basics|A2
reason|причина|basics|B1
way|путь, способ|basics|A2
part|часть|basics|A2
side|сторона|basics|A2
end|конец|basics|A1
beginning|начало|basics|A2
example|пример|education|A2
fact|факт|basics|B1
truth|правда|basics|B1
story|история, рассказ|basics|A2
news|новости|basics|A2
information|информация|basics|B1
number|число, номер|basics|A1
group|группа|basics|A2
list|список|basics|A1
order|порядок, заказ|basics|A2
change|изменение|basics|A2
choice|выбор|basics|B1
chance|шанс, возможность|basics|B1
goal|цель|basics|B1
result|результат|basics|B1
level|уровень|basics|A2
# --- Common verbs ---
become|становиться|verbs|B1
happen|случаться|verbs|A2
believe|верить|verbs|A2
hope|надеяться|verbs|A2
expect|ожидать|verbs|B1
decide|решать|verbs|A2
choose|выбирать|verbs|A2
explain|объяснять|verbs|A2
describe|описывать|verbs|B1
remember|помнить|verbs|A2
forget|забывать|verbs|A2
understand|понимать|verbs|A1
learn|учить, узнавать|verbs|A1
teach|учить, преподавать|verbs|A2
study|учиться, изучать|verbs|A1
improve|улучшать|verbs|B1
create|создавать|verbs|B1
build|строить|verbs|A2
break|ломать|verbs|A2
fix|чинить|verbs|A2
change|менять|verbs|A1
move|двигать, переезжать|verbs|A2
bring|приносить|verbs|A2
carry|нести|verbs|A2
hold|держать|verbs|A2
pull|тянуть|verbs|A2
push|толкать|verbs|A2
throw|бросать|verbs|A2
catch|ловить|verbs|A2
drop|ронять|verbs|A2
lift|поднимать|verbs|B1
turn|поворачивать|verbs|A1
follow|следовать|verbs|A2
lead|вести, руководить|verbs|B1
join|присоединяться|verbs|A2
share|делиться|verbs|A2
add|добавлять|verbs|A1
remove|удалять|verbs|B1
keep|хранить, держать|verbs|A2
lose|терять, проигрывать|verbs|A2
win|выигрывать|verbs|A2
allow|разрешать|verbs|B1
refuse|отказываться|verbs|B1
accept|принимать|verbs|B1
agree|соглашаться|verbs|A2
argue|спорить|verbs|B1
compare|сравнивать|verbs|B1
consider|рассматривать|verbs|B2
continue|продолжать|verbs|A2
finish|заканчивать|verbs|A1
complete|завершать|verbs|B1
prepare|готовить|verbs|A2
develop|развивать|verbs|B1
manage|управлять, справляться|verbs|B1
control|контролировать|verbs|B1
protect|защищать|verbs|B1
save|спасать, сохранять|verbs|A2
waste|тратить впустую|verbs|B1
spend|тратить, проводить|verbs|A2
earn|зарабатывать|verbs|B1
offer|предлагать|verbs|B1
provide|обеспечивать|verbs|B2
receive|получать|verbs|B1
return|возвращать|verbs|A2
repeat|повторять|verbs|A2
practice|практиковать|verbs|A2
measure|измерять|verbs|B1
count|считать|verbs|A2
appear|появляться|verbs|B1
disappear|исчезать|verbs|B1
show|показывать|verbs|A1
hide|прятать|verbs|A2
seem|казаться|verbs|B1
mention|упоминать|verbs|B2
suggest|предлагать|verbs|B1
promise|обещать|verbs|A2
warn|предупреждать|verbs|B1
complain|жаловаться|verbs|B1
relax|расслабляться|verbs|A2
worry|беспокоиться|verbs|A2
enjoy|наслаждаться|verbs|A2
prefer|предпочитать|verbs|A2
realize|осознавать|verbs|B2
notice|замечать|verbs|B1
recognize|узнавать|verbs|B1
imagine|представлять|verbs|B1
discover|обнаруживать|verbs|B1
search|искать|verbs|A2
find|находить|verbs|A1
reach|достигать|verbs|B1
avoid|избегать|verbs|B1
prevent|предотвращать|verbs|B2
allow|позволять|verbs|B1
# --- Adjectives ---
good|хороший|adjectives|A1
bad|плохой|adjectives|A1
big|большой|adjectives|A1
small|маленький|adjectives|A1
large|крупный|adjectives|A2
long|длинный|adjectives|A1
short|короткий|adjectives|A1
tall|высокий|adjectives|A1
high|высокий|adjectives|A1
low|низкий|adjectives|A1
wide|широкий|adjectives|A2
narrow|узкий|adjectives|B1
thick|толстый|adjectives|A2
thin|тонкий|adjectives|A2
heavy|тяжёлый|adjectives|A2
light|лёгкий, светлый|adjectives|A2
strong|сильный|adjectives|A2
weak|слабый|adjectives|A2
fast|быстрый|adjectives|A1
slow|медленный|adjectives|A1
early|ранний|adjectives|A2
late|поздний|adjectives|A2
easy|лёгкий, простой|adjectives|A1
hard|трудный, твёрдый|adjectives|A1
difficult|трудный|adjectives|A2
simple|простой|adjectives|A2
important|важный|adjectives|A2
useful|полезный|adjectives|A2
useless|бесполезный|adjectives|B1
possible|возможный|adjectives|A2
impossible|невозможный|adjectives|B1
real|настоящий|adjectives|A2
true|правдивый|adjectives|A2
false|ложный|adjectives|A2
free|свободный, бесплатный|adjectives|A1
busy|занятый|adjectives|A2
rich|богатый|adjectives|A2
poor|бедный|adjectives|A2
expensive|дорогой|adjectives|A2
cheap|дешёвый|adjectives|A2
clean|чистый|adjectives|A1
dirty|грязный|adjectives|A1
full|полный|adjectives|A1
empty|пустой|adjectives|A2
open|открытый|adjectives|A1
closed|закрытый|adjectives|A1
new|новый|adjectives|A1
old|старый|adjectives|A1
young|молодой|adjectives|A1
modern|современный|adjectives|A2
beautiful|красивый|adjectives|A1
ugly|уродливый|adjectives|A2
pretty|симпатичный|adjectives|A2
famous|известный|adjectives|A2
popular|популярный|adjectives|A2
friendly|дружелюбный|adjectives|A2
kind|добрый|adjectives|A1
cruel|жестокий|adjectives|B2
polite|вежливый|adjectives|B1
rude|грубый|adjectives|B1
honest|честный|adjectives|B1
brave|храбрый|adjectives|B1
clever|умный|adjectives|A2
smart|умный|adjectives|A2
stupid|глупый|adjectives|A2
serious|серьёзный|adjectives|A2
funny|смешной|adjectives|A2
strange|странный|adjectives|A2
normal|нормальный|adjectives|A2
common|обычный, общий|adjectives|B1
rare|редкий|adjectives|B1
special|особенный|adjectives|A2
safe|безопасный|adjectives|A2
dangerous|опасный|adjectives|A2
quiet|тихий|adjectives|A2
loud|громкий|adjectives|A2
bright|яркий|adjectives|A2
dark|тёмный|adjectives|A1
fresh|свежий|adjectives|A2
perfect|идеальный|adjectives|A2
ready|готовый|adjectives|A1
tired|уставший|adjectives|A1
sick|больной|adjectives|A1
healthy|здоровый|adjectives|A2
fair|справедливый|adjectives|B1
wrong|неправильный|adjectives|A1
right|правильный|adjectives|A1
sure|уверенный|adjectives|A2
# --- People / family / professions ---
person|человек|people|A1
people|люди|people|A1
man|мужчина|people|A1
woman|женщина|people|A1
child|ребёнок|people|A1
baby|малыш|people|A1
boy|мальчик|people|A1
girl|девочка|people|A1
family|семья|people|A1
parents|родители|people|A1
mother|мать|people|A1
father|отец|people|A1
son|сын|people|A1
daughter|дочь|people|A1
brother|брат|people|A1
sister|сестра|people|A1
grandmother|бабушка|people|A1
grandfather|дедушка|people|A1
husband|муж|people|A2
wife|жена|people|A2
friend|друг|people|A1
neighbour|сосед|people|A2
stranger|незнакомец|people|B1
guest|гость|people|A2
teacher|учитель|people|A1
student|студент|people|A1
doctor|врач|people|A1
nurse|медсестра|people|A2
engineer|инженер|people|A2
lawyer|юрист|people|B1
manager|менеджер|people|A2
writer|писатель|people|A2
artist|художник|people|A2
scientist|учёный|people|B1
driver|водитель|people|A1
farmer|фермер|people|A2
worker|рабочий|people|A2
boss|начальник|people|A2
customer|клиент|people|A2
leader|лидер|people|B1
team|команда|people|A2
# --- Body / health ---
body|тело|body|A1
head|голова|body|A1
hair|волосы|body|A1
face|лицо|body|A1
eye|глаз|body|A1
ear|ухо|body|A1
nose|нос|body|A1
mouth|рот|body|A1
tooth|зуб|body|A1
tongue|язык|body|A2
neck|шея|body|A1
shoulder|плечо|body|A2
arm|рука|body|A1
hand|кисть руки|body|A1
finger|палец|body|A1
leg|нога|body|A1
foot|ступня|body|A1
knee|колено|body|A2
heart|сердце|body|A1
brain|мозг|body|A2
stomach|желудок|body|A2
blood|кровь|body|A2
skin|кожа|body|A2
bone|кость|body|B1
health|здоровье|body|A2
pain|боль|body|A2
disease|болезнь|body|B1
medicine|лекарство|body|A2
doctor|доктор|body|A1
hospital|больница|body|A1
fever|жар, температура|body|B1
cough|кашель|body|B1
injury|травма|body|B1
# --- Food / drink ---
food|еда|food|A1
water|вода|food|A1
bread|хлеб|food|A1
milk|молоко|food|A1
egg|яйцо|food|A1
meat|мясо|food|A1
chicken|курица|food|A1
fish|рыба|food|A1
rice|рис|food|A1
soup|суп|food|A1
salad|салат|food|A1
cheese|сыр|food|A1
butter|масло|food|A2
sugar|сахар|food|A1
salt|соль|food|A1
pepper|перец|food|A2
oil|масло|food|A2
fruit|фрукт|food|A1
apple|яблоко|food|A1
banana|банан|food|A1
orange|апельсин|food|A1
lemon|лимон|food|A2
grape|виноград|food|A2
vegetable|овощ|food|A1
potato|картофель|food|A1
tomato|помидор|food|A1
carrot|морковь|food|A2
onion|лук|food|A2
tea|чай|food|A1
coffee|кофе|food|A1
juice|сок|food|A1
breakfast|завтрак|food|A1
lunch|обед|food|A1
dinner|ужин|food|A1
meal|приём пищи|food|A2
plate|тарелка|food|A2
glass|стакан|food|A2
spoon|ложка|food|A2
fork|вилка|food|A2
knife|нож|food|A2
# --- Home ---
home|дом|home|A1
house|дом|home|A1
flat|квартира|home|A1
room|комната|home|A1
kitchen|кухня|home|A1
bathroom|ванная|home|A1
bedroom|спальня|home|A1
wall|стена|home|A2
floor|пол|home|A1
ceiling|потолок|home|B1
roof|крыша|home|A2
door|дверь|home|A1
window|окно|home|A1
key|ключ|home|A1
bed|кровать|home|A1
table|стол|home|A1
chair|стул|home|A1
sofa|диван|home|A2
shelf|полка|home|A2
lamp|лампа|home|A2
mirror|зеркало|home|A2
fridge|холодильник|home|A2
oven|духовка|home|B1
garden|сад|home|A1
garage|гараж|home|A2
stairs|лестница|home|A2
furniture|мебель|home|A2
# --- City / places ---
city|город|city|A1
town|городок|city|A1
village|деревня|city|A2
street|улица|city|A1
road|дорога|city|A1
square|площадь|city|A2
park|парк|city|A1
bridge|мост|city|A2
shop|магазин|city|A1
store|магазин|city|A1
market|рынок|city|A2
bank|банк|city|A1
hospital|больница|city|A1
school|школа|city|A1
library|библиотека|city|A1
museum|музей|city|A1
theatre|театр|city|A2
cinema|кинотеатр|city|A1
restaurant|ресторан|city|A1
cafe|кафе|city|A1
hotel|отель|city|A1
church|церковь|city|A2
station|станция|city|A1
airport|аэропорт|city|A1
factory|завод|city|B1
office|офис|city|A1
building|здание|city|A1
# --- Travel / transport ---
travel|путешествие|travel|A2
trip|поездка|travel|A2
journey|путешествие|travel|B1
car|машина|travel|A1
bus|автобус|travel|A1
train|поезд|travel|A1
plane|самолёт|travel|A1
ship|корабль|travel|A2
boat|лодка|travel|A2
bike|велосипед|travel|A1
taxi|такси|travel|A1
ticket|билет|travel|A1
passport|паспорт|travel|A2
luggage|багаж|travel|B1
map|карта|travel|A1
route|маршрут|travel|B1
distance|расстояние|travel|B1
speed|скорость|travel|B1
traffic|движение, пробки|travel|B1
driver|водитель|travel|A1
passenger|пассажир|travel|B1
flight|рейс|travel|A2
# --- Nature / weather ---
nature|природа|nature|A2
sun|солнце|nature|A1
moon|луна|nature|A1
star|звезда|nature|A1
sky|небо|nature|A1
cloud|облако|nature|A1
rain|дождь|nature|A1
snow|снег|nature|A1
wind|ветер|nature|A1
storm|шторм|nature|B1
fog|туман|nature|B1
ice|лёд|nature|A2
fire|огонь|nature|A1
water|вода|nature|A1
earth|земля|nature|A2
air|воздух|nature|A2
sea|море|nature|A1
ocean|океан|nature|A2
river|река|nature|A1
lake|озеро|nature|A1
mountain|гора|nature|A1
hill|холм|nature|A2
forest|лес|nature|A1
tree|дерево|nature|A1
flower|цветок|nature|A1
grass|трава|nature|A1
leaf|лист|nature|A2
stone|камень|nature|A2
sand|песок|nature|A2
weather|погода|nature|A1
# --- Animals ---
animal|животное|nature|A1
dog|собака|nature|A1
cat|кошка|nature|A1
horse|лошадь|nature|A1
cow|корова|nature|A1
pig|свинья|nature|A1
sheep|овца|nature|A2
rabbit|кролик|nature|A2
mouse|мышь|nature|A2
bird|птица|nature|A1
chicken|курица|nature|A1
duck|утка|nature|A2
fish|рыба|nature|A1
bear|медведь|nature|A2
wolf|волк|nature|A2
fox|лиса|nature|A2
lion|лев|nature|A2
tiger|тигр|nature|A2
elephant|слон|nature|A2
monkey|обезьяна|nature|A2
snake|змея|nature|A2
insect|насекомое|nature|B1
bee|пчела|nature|A2
spider|паук|nature|A2
# --- Time / calendar ---
today|сегодня|time|A1
tomorrow|завтра|time|A1
yesterday|вчера|time|A1
morning|утро|time|A1
evening|вечер|time|A1
noon|полдень|time|B1
midnight|полночь|time|B1
spring|весна|time|A1
summer|лето|time|A1
autumn|осень|time|A1
winter|зима|time|A1
Monday|понедельник|time|A1
Tuesday|вторник|time|A1
Wednesday|среда|time|A1
Thursday|четверг|time|A1
Friday|пятница|time|A1
Saturday|суббота|time|A1
Sunday|воскресенье|time|A1
clock|часы|time|A1
calendar|календарь|time|A2
holiday|праздник, отпуск|time|A2
birthday|день рождения|time|A1
# --- Work / business ---
work|работа|work|A1
job|работа|work|A1
salary|зарплата|work|B1
meeting|встреча|work|A2
project|проект|work|A2
task|задача|work|A2
deadline|срок|work|B1
report|отчёт|work|B1
company|компания|work|A2
business|бизнес|work|A2
client|клиент|work|A2
contract|договор|work|B1
profit|прибыль|work|B1
market|рынок|work|B1
product|продукт|work|A2
service|услуга|work|A2
price|цена|work|A1
career|карьера|work|B1
experience|опыт|work|B1
skill|навык|work|B1
employee|сотрудник|work|B1
employer|работодатель|work|B1
interview|собеседование|work|B1
office|офис|work|A1
# --- Education ---
education|образование|education|B1
school|школа|education|A1
university|университет|education|A2
college|колледж|education|A2
lesson|урок|education|A1
class|класс, занятие|education|A1
subject|предмет|education|A2
homework|домашнее задание|education|A1
exam|экзамен|education|A2
test|тест|education|A1
grade|оценка|education|A2
degree|степень, диплом|education|B1
knowledge|знание|education|B1
book|книга|education|A1
notebook|тетрадь|education|A1
pen|ручка|education|A1
pencil|карандаш|education|A1
dictionary|словарь|education|A2
language|язык|education|A1
science|наука|education|A2
history|история|education|A1
maths|математика|education|A1
# --- Technology / internet ---
computer|компьютер|tech|A1
laptop|ноутбук|tech|A2
phone|телефон|tech|A1
screen|экран|tech|A2
keyboard|клавиатура|tech|A2
mouse|мышь|tech|A2
file|файл|tech|A2
folder|папка|tech|A2
program|программа|tech|A2
app|приложение|tech|A2
software|программное обеспечение|tech|B1
hardware|оборудование|tech|B2
internet|интернет|tech|A2
website|сайт|tech|A2
email|электронная почта|tech|A2
password|пароль|tech|A2
network|сеть|tech|B1
data|данные|tech|B1
memory|память|tech|B1
device|устройство|tech|B1
battery|батарея|tech|A2
signal|сигнал|tech|B1
update|обновление|tech|B1
download|скачивать|tech|A2
upload|загружать|tech|B1
# --- Money / shopping ---
money|деньги|shopping|A1
cash|наличные|shopping|B1
coin|монета|shopping|A2
price|цена|shopping|A1
cost|стоимость|shopping|A2
discount|скидка|shopping|B1
sale|распродажа|shopping|A2
bill|счёт|shopping|A2
card|карта|shopping|A1
change|сдача|shopping|A2
shop|магазин|shopping|A1
customer|покупатель|shopping|A2
basket|корзина|shopping|A2
receipt|чек|shopping|B1
budget|бюджет|shopping|B1
expensive|дорогой|shopping|A2
cheap|дешёвый|shopping|A2
buy|покупать|shopping|A1
sell|продавать|shopping|A1
pay|платить|shopping|A1
# --- Emotions / character ---
happy|счастливый|emotions|A1
sad|грустный|emotions|A1
angry|злой|emotions|A1
afraid|испуганный|emotions|A2
scared|напуганный|emotions|A2
nervous|нервный|emotions|B1
calm|спокойный|emotions|B1
excited|взволнованный|emotions|A2
bored|скучающий|emotions|A2
tired|уставший|emotions|A1
proud|гордый|emotions|B1
shy|застенчивый|emotions|B1
jealous|ревнивый|emotions|B2
lonely|одинокий|emotions|B1
confused|растерянный|emotions|B1
surprised|удивлённый|emotions|A2
worried|обеспокоенный|emotions|A2
relaxed|расслабленный|emotions|B1
grateful|благодарный|emotions|B2
confident|уверенный|emotions|B1
feeling|чувство|emotions|A2
mood|настроение|emotions|B1
love|любовь|emotions|A1
fear|страх|emotions|A2
joy|радость|emotions|B1
anger|гнев|emotions|B1
stress|стресс|emotions|B1
# --- Communication / social ---
language|язык|basics|A1
conversation|разговор|basics|B1
message|сообщение|basics|A2
letter|письмо|basics|A1
call|звонок|basics|A1
advice|совет|basics|B1
opinion|мнение|basics|B1
agreement|соглашение|basics|B2
discussion|обсуждение|basics|B1
meeting|встреча|basics|A2
invitation|приглашение|basics|B1
promise|обещание|basics|A2
request|просьба|basics|B1
thanks|благодарность|basics|A1
apology|извинение|basics|B1
greeting|приветствие|basics|A2
# --- Abstract / B2 ---
ability|способность|advanced|B1
attention|внимание|advanced|B1
behaviour|поведение|advanced|B2
condition|условие, состояние|advanced|B2
connection|связь|advanced|B1
difference|разница|advanced|A2
effect|эффект, влияние|advanced|B1
effort|усилие|advanced|B1
energy|энергия|advanced|A2
experience|опыт|advanced|B1
freedom|свобода|advanced|B1
future|будущее|advanced|A2
habit|привычка|advanced|B1
imagination|воображение|advanced|B2
importance|важность|advanced|B2
influence|влияние|advanced|B2
knowledge|знание|advanced|B1
meaning|значение|advanced|B1
memory|память|advanced|B1
method|метод|advanced|B1
opportunity|возможность|advanced|B2
power|сила, власть|advanced|A2
pressure|давление|advanced|B2
progress|прогресс|advanced|B1
purpose|цель|advanced|B1
quality|качество|advanced|B1
quantity|количество|advanced|B1
relationship|отношения|advanced|B1
responsibility|ответственность|advanced|B2
risk|риск|advanced|B1
situation|ситуация|advanced|A2
society|общество|advanced|B1
solution|решение|advanced|B1
success|успех|advanced|A2
system|система|advanced|B1
value|ценность|advanced|B1
`;

export const pack3Words: Word[] = RAW.split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => {
    const [en, ru, category, level] = line.split("|");
    return {
      id: _id++,
      en,
      ru,
      transcription: "",
      example: "",
      category,
      level: level as Word["level"],
    } as Word;
  });
