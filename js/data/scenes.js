import { addItem, addParam, setFlag, getFlag, hasItem, state } from '../state.js';

// アクション関数レジストリ
const actions = {
  checkFridge(s) {
    setFlag('checkedFridge');
    addParam('nihil');
  },
  openNote(s) {
    setFlag('noteOpened');
    addItem('photo');
    addParam('bond');
  },
  checkPC(s) {
    setFlag('checkedPC');
    addParam('truth');
  },
  buyBeer(s) {
    addParam('nihil');
  },
  buyCoffee(s) {
    addItem('coffee');
    addParam('hope');
  },
  stopRobber(s) {
    setFlag('stoppedRobber');
    addParam('hope', 2);
    addParam('bond');
  },
  robRegister(s) {
    setFlag('looted');
    addParam('wrath', 2);
  },
  talkHomeless(s) {
    setFlag('talkedHomeless');
    addParam('bond');
  },
  giveCoffee(s) {
    setFlag('gaveCoffee');
    s.items = s.items.filter(i => i !== 'coffee');
    addParam('hope', 2);
    addParam('bond');
  },
  talkClassmate(s) {
    setFlag('metClassmate');
    addParam('bond', 2);
  },
  checkYearbook(s) {
    addParam('truth');
    addParam('bond');
  },
  sitInMeeting(s) {
    addParam('nihil');
    setFlag('attendedMeeting');
  },
  stealBoss(s) {
    setFlag('looted');
    addParam('wrath', 2);
  },
  meditate(s) {
    addParam('nihil', 2);
    const count = (s.flags.meditateCount || 0) + 1;
    setFlag('meditateCount', count);
    if (count >= 3) setFlag('meditatedThrice');
  },
  getOmamori(s) {
    addItem('omamori');
    addParam('truth');
  },
  kickBox(s) {
    setFlag('looted');
    addParam('wrath');
  },
  watchBand(s) {
    addParam('bond');
    addParam('hope');
  },
  joinBand(s) {
    addParam('bond', 2);
    addParam('hope', 2);
    setFlag('joinedBand');
  },
  helpNurse(s) {
    addParam('hope', 2);
    addParam('bond');
    setFlag('helpedHospital');
  },
  getPaper(s) {
    addItem('paper');
    addParam('truth', 2);
  },
  getTelescope(s) {
    addItem('telescope');
    addParam('truth');
  },
  observeSky(s) {
    setFlag('observedSky');
    addParam('truth', 2);
  },
  callParents(s) {
    addParam('bond');
    setFlag('calledParents');
  },
  talkStranger(s) {
    addParam('bond');
    addParam('hope');
    setFlag('talkedStranger');
  },
  talkPreacher(s) {
    addParam('nihil');
  },
  talkDog(s) {
    addParam('bond');
    setFlag('foundDog');
  },
  meditateRiver(s) {
    addParam('nihil');
  },
  yell(s) {
    addParam('wrath');
  },
};

export function runAction(name, s) {
  if (actions[name]) actions[name](s);
}

// シーン定義
export const scenes = {
  // ─── 自宅アパート ───
  apartment: {
    id: 'apartment',
    name: '自宅アパート',
    text: (s) => `築40年の1K。ベランダから赤い空が見える。
テレビは隕石のニュースを延々と流している。${
  s.flags.checkedFridge ? '\n冷蔵庫はもう空だ。' : ''
}${
  s.flags.checkedPC ? '\n画面にはNASAの軌道データが表示されたままだ。' : ''
}`,
    choices: (s) => [
      { label: 'ベランダに出る', cost: 1, next: 'apartment_balcony' },
      { label: '冷蔵庫を開ける', cost: 1, action: 'checkFridge', next: 'apartment',
        hidden: s.flags.checkedFridge,
        result: () => `冷気が漏れる音だけがする。
中はもう空だった。賞味期限の切れたヨーグルトが一つ。
それも要らないと思った。` },
      { label: 'PCで隕石情報を調べる', cost: 2, action: 'checkPC', next: 'apartment',
        hidden: s.flags.checkedPC,
        result: () => `NASAの軌道データを開く。数字は冷静で、結論は冷酷だった。
誤差範囲はもうない。
画面の青白い光が、部屋を照らしている。` },
      { label: s.flags.noteOpened ? 'LINEを読み返す' : '母からの未読LINEを開く',
        cost: 1, action: 'openNote', next: 'apartment',
        hidden: s.flags.noteOpened && !s.items.includes('note'),
        result: () => `「ごはん食べてる?」
何年も前のメッセージのようだった。実際は三日前だった。
古いアルバムの写真を一枚、財布に挟んだ。` },
      { label: 'コンビニへ向かう', cost: 3, next: 'convenience' },
      { label: '実家へ向かう', cost: 5, next: 'parents',
        if: (s) => s.items.includes('key_home') },
      { label: '駅前へ向かう', cost: 3, next: 'station' },
    ],
  },

  apartment_balcony: {
    id: 'apartment_balcony',
    name: '自宅アパート — ベランダ',
    text: () => `空は赤みを帯びている。雲の隙間から、光の筋が見えた。
隣の部屋のツバキが洗濯物を取り込んでいた。
「今日は雨かな」とツバキはつぶやいた。
隕石のことは言わなかった。主人公も言わなかった。`,
    choices: () => [
      { label: '隣の住人に声をかける', cost: 2, action: 'talkStranger', next: 'apartment_balcony',
        result: () => `「いい天気ですね」と、ありえない言葉を交わした。
ツバキは少し笑って、洗濯物を畳み続けた。
洗剤の香りが、赤い空に上っていった。` },
      { label: '空を見続ける', cost: 1, action: 'meditateRiver', next: 'apartment' },
      { label: '部屋に戻る', cost: 1, next: 'apartment' },
    ],
  },

  // ─── コンビニ ───
  convenience: {
    id: 'convenience',
    name: 'コンビニ',
    text: (s) => `セブンの自動ドアが開く。店内BGMは平常運転だった。
「いらっしゃいませ」${
  s.flags.stoppedRobber ? '\nさっきの一件で、店員のナギさんとは顔見知りになった。' : ''
}${
  s.flags.gaveCoffee ? '\nテツの姿はもうない。' : ''
}
棚にはほとんど何も残っていなかった。水と、おでんと、缶コーヒーだけ。`,
    choices: (s) => [
      { label: '缶コーヒーを買う (¥120)', cost: 2, action: 'buyCoffee', next: 'convenience',
        hidden: s.items.includes('coffee') || s.flags.gaveCoffee,
        result: () => `温まっていない缶を握りしめる。
レジで「あたたまってないですけど」とナギさんが言った。
「いいんです」と答えた。` },
      { label: 'ビールを買う', cost: 1, action: 'buyBeer', next: 'convenience',
        result: () => `プルタブを引いた音が、店内に響く。
苦味が舌にしみた。今日は何も食べていない。` },
      { label: '強盗を止める', cost: 3, action: 'stopRobber', next: 'convenience',
        hidden: s.flags.stoppedRobber,
        if: (s) => !s.flags.stoppedRobber,
        result: () => `店員のナギさんと目が合った。
強盗の手は震えていた。何も持たずに走り去った。
「ありがとうございました」とナギさんが頭を下げた。` },
      { label: 'レジから金を盗る', cost: 2, action: 'robRegister', next: 'convenience',
        hidden: s.flags.looted,
        result: () => `誰も止めなかった。
札束を握る手が、思ったより震えていない。
ナギさんは無表情で、こちらを見ていた。` },
      { label: '店の外のテツに話しかける', cost: 2, action: 'talkHomeless', next: 'convenience',
        hidden: s.flags.gaveCoffee || s.flags.talkedHomeless,
        result: () => `段ボールに座ったテツは、空を指さした。
「あれが見えるか? あれが本物だ」
よくわからないが、頷いた。` },
      { label: 'テツに缶コーヒーを渡す', cost: 1, action: 'giveCoffee', next: 'convenience',
        if: (s) => s.items.includes('coffee') && !s.flags.gaveCoffee,
        result: () => `「あったかいな」とテツは笑った。
両手で缶を包み込んだ。
「お前、いいやつだな」` },
      { label: 'アパートへ戻る', cost: 3, next: 'apartment' },
      { label: '駅前へ向かう', cost: 3, next: 'station' },
      { label: '河川敷へ向かう', cost: 5, next: 'riverbed' },
    ],
  },

  // ─── 駅前ロータリー ───
  station: {
    id: 'station',
    name: '駅前ロータリー',
    text: (s) => `人がまばらに座り込んでいる。空には赤い光の筋が走っている。
誰かが「神の怒りだ！」と演説している。
タクシーは全部捕まらない。${
  s.flags.foundDog ? '\n迷子の犬はもう飼い主のもとに帰った。' : ''
}`,
    choices: (s) => [
      { label: '演説する人に話しかける', cost: 2, action: 'talkPreacher', next: 'station',
        result: () => `「あなたも罪を悔い改めなさい!」
拡声器越しの声が、耳に刺さる。
何の罪のことだろう、と少しだけ考えた。` },
      { label: '迷子の犬を保護する', cost: 2, action: 'talkDog', next: 'station',
        hidden: s.flags.foundDog,
        result: () => `首輪に名前があった。「ハル」と書いてあった。
番号に電話すると、すぐに飼い主が来た。
ハルは尻尾を振りっぱなしだった。` },
      { label: '見知らぬ人と話す', cost: 2, action: 'talkStranger', next: 'station',
        result: () => `ベンチに腰をかけた女性が「終わるんですね」と言った。
「ええ、終わりますね」と答えた。
それだけの会話だった。何故か、心が少し軽くなった。` },
      { label: 'アパートへ戻る', cost: 3, next: 'apartment' },
      { label: '母校へ向かう', cost: 5, next: 'school' },
      { label: '神社へ向かう', cost: 5, next: 'shrine' },
      { label: 'コンビニへ向かう', cost: 3, next: 'convenience' },
    ],
  },

  // ─── 母校 ───
  school: {
    id: 'school',
    name: '母校',
    text: (s) => `鉄製のフェンスが半開きになっている。校庭に入れた。
桜が咲いている。このタイミングで咲いている。${
  s.flags.metClassmate
    ? '\nカナタの姿はもう見えない。でも何か残った気がする。'
    : '\n遠くにカナタの後ろ姿がある。'
}`,
    choices: (s) => [
      { label: 'カナタに声をかける', cost: 3, action: 'talkClassmate', next: 'school',
        hidden: s.flags.metClassmate,
        result: () => `振り向いたカナタは、少し驚いた顔をして、それから笑った。
「久しぶりだね」
桜の花びらが、二人の間を流れていった。` },
      { label: '卒業アルバムを探す', cost: 2, action: 'checkYearbook', next: 'school',
        if: (s) => s.items.includes('photo'),
        result: () => `図書室の隅で見つけた。表紙の革は色が抜けていた。
集合写真の中に、自分の顔があった。
こんな顔だったのか、と思った。` },
      { label: '校庭で空を見上げる', cost: 1, action: 'meditateRiver', next: 'school',
        result: () => `鉄棒の冷たさが手のひらに伝わる。
赤い空に、薄い雲が一筋。
昔ここで、何度も逆上がりに失敗した。` },
      { label: '駅前へ戻る', cost: 5, next: 'station' },
      { label: '職場へ向かう', cost: 5, next: 'office' },
    ],
  },

  // ─── 職場ビル ───
  office: {
    id: 'office',
    name: '職場ビル',
    text: (s) => `エレベーターは動いていた。社員証がまだ使えた。
会議室ではムラセ部長がまだ会議をしていた。スライドには「Q4予算計画」と書いてある。${
  s.flags.attendedMeeting ? '\n会議は今も続いている。終わる気配がない。' : ''
}`,
    choices: (s) => [
      { label: '会議に参加する', cost: 3, action: 'sitInMeeting', next: 'office',
        result: () => `ムラセ部長は「Q4の予算配分について」と話し続けている。
誰も止めない。誰も笑わない。
みんな、何かを終わらせたいだけなのかもしれない。` },
      { label: 'ムラセ部長の財布から抜く', cost: 2, action: 'stealBoss', next: 'office',
        hidden: s.flags.looted,
        result: () => `スーツの内ポケットから、革の財布を抜いた。
ムラセ部長は気づかなかった。
札を抜いて、財布だけ椅子の下に戻した。` },
      { label: '屋上へ向かう', cost: 2, next: 'rooftop' },
      { label: '母校へ戻る', cost: 5, next: 'school' },
      { label: '病院へ向かう', cost: 3, next: 'hospital' },
    ],
  },

  // ─── 神社 ───
  shrine: {
    id: 'shrine',
    name: '神社',
    text: (s) => {
      const count = s.flags.meditateCount || 0;
      return `鳥居をくぐると、空気が変わる気がした。
ジョウという老神主が境内を掃き掃除している。隕石? 知ったことではないというような顔だ。${
  count >= 1 ? `\n瞑想回数: ${count}回。心が少し軽くなった気がする。` : ''
}${
  s.items.includes('omamori') ? '\nお守りが手の中で温かい。' : ''
}`;
    },
    choices: (s) => [
      { label: '瞑想する', cost: 3, action: 'meditate', next: 'shrine',
        result: () => `息を吸って、吐いて、を繰り返した。
雑念が浮かぶたび、また数えなおした。
時間の感覚が、少しだけ遠のいた気がした。` },
      { label: 'お守りをもらう', cost: 2, action: 'getOmamori', next: 'shrine',
        hidden: s.items.includes('omamori'),
        result: () => `ジョウ神主が、無言で差し出した。
「これは古いやつだ」とだけ言った。
小さな布袋に、何か硬い物が入っている。` },
      { label: '賽銭箱を蹴る', cost: 2, action: 'kickBox', next: 'shrine',
        hidden: s.flags.looted,
        result: () => `鈍い音がした。
木が割れた音ではない、自分の足の音だった。
ジョウ神主は箒の手を止めずに、こちらを見もしなかった。` },
      { label: '神主と話す', cost: 2, action: 'talkPreacher', next: 'shrine',
        result: () => `「世の終わりですね」と言ってみた。
ジョウ神主は箒を動かしながら、「いつもの日と変わらん」とだけ答えた。
落ち葉がまた一枚、境内に落ちた。` },
      { label: '駅前へ戻る', cost: 5, next: 'station' },
      { label: '河川敷へ向かう', cost: 5, next: 'riverbed' },
    ],
  },

  // ─── 河川敷 ───
  riverbed: {
    id: 'riverbed',
    name: '河川敷',
    text: (s) => `バンドが演奏している。ドラム、ギター、ベース。
観客は5人くらいしかいない。でも全力だった。${
  s.flags.joinedBand ? '\n一緒に歌った声がまだ喉に残っている。' : ''
}
川の水が夕焼けで赤く染まっている。`,
    choices: (s) => [
      { label: 'バンドの演奏を聴く', cost: 2, action: 'watchBand', next: 'riverbed',
        result: () => `ベースの音が、腹に響く。
ボーカルは目を瞑って歌っている。歌詞は聞き取れない。
それでも、何かが伝わった気がした。` },
      { label: 'バンドと一緒に歌う', cost: 3, action: 'joinBand', next: 'riverbed',
        hidden: s.flags.joinedBand,
        result: () => `「どうぞ!」とマイクを差し出された。
歌詞は知らないのに、何故か声が出た。
五人の観客のうち、二人が一緒に歌い出した。` },
      { label: '河川敷で一人で空を見る', cost: 1, action: 'meditateRiver', next: 'riverbed',
        result: () => `草の上に仰向けになった。
赤い空が大きすぎて、視界の端まで埋めている。
このまま吸い込まれてもいい、と少し思った。` },
      { label: '空に向かって叫ぶ', cost: 2, action: 'yell', next: 'riverbed',
        result: () => `腹の底から声を出した。
喉が痛くなるまで、意味のない音を出し続けた。
川の流れる音が、全部を消していった。` },
      { label: 'コンビニへ戻る', cost: 5, next: 'convenience' },
      { label: '神社へ向かう', cost: 5, next: 'shrine' },
    ],
  },

  // ─── 総合病院 ───
  hospital: {
    id: 'hospital',
    name: '総合病院',
    text: (s) => `ロビーは混雑していた。でも全員が穏やかだった。
どこかあきらめたような、穏やかさだった。${
  s.flags.helpedHospital ? '\nミオさんが「ありがとう」と言った。ちゃんと聞こえた。' : ''
}${
  s.items.includes('paper') ? '\n研究論文の切れ端が、ポケットの中で折りたたまれている。' : ''
}`,
    choices: (s) => [
      { label: 'ミオさんの手伝いをする', cost: 4, action: 'helpNurse', next: 'hospital',
        hidden: s.flags.helpedHospital,
        result: () => `病室を回る。シーツを替え、水を運び、雑談に付き合う。
ミオさんは無駄なく動いていた。
「ありがとう」と言われたとき、ちゃんと返事ができた。` },
      { label: '待合室の患者と話す', cost: 2, action: 'talkStranger', next: 'hospital',
        result: () => `向かいの椅子に座った老人が、孫の写真を見せてくれた。
「もう会えないだろうな」と言って、すぐに笑った。
「でも、見せられて、よかった」` },
      { label: '廊下に落ちていた論文を拾う', cost: 1, action: 'getPaper', next: 'hospital',
        hidden: s.items.includes('paper'),
        result: () => `英文の研究論文。題名に「impact trajectory」の文字。
誰かの机から滑り落ちたのだろう。
ポケットに、畳んでしまった。` },
      { label: '屋上へ向かう', cost: 2, next: 'rooftop' },
      { label: '職場へ戻る', cost: 3, next: 'office' },
    ],
  },

  // ─── 高層ビル屋上 ───
  rooftop: {
    id: 'rooftop',
    name: '高層ビル屋上',
    text: (s) => `風が強い。東京の全部が見える。
空が一番よく見える場所だった。隕石も——見える。
思ったより大きかった。月くらいある。${
  s.items.includes('telescope') ? '\n望遠鏡を覗くと、表面の模様まで見えた。' : ''
}${
  s.flags.observedSky ? '\n軌道を計算した。何かがおかしい。' : ''
}`,
    choices: (s) => [
      { label: '空を観測する', cost: 2, action: 'observeSky', next: 'rooftop',
        if: (s) => s.items.includes('telescope'),
        result: () => `望遠鏡の中で、隕石の表面が見える。クレーター、亀裂。
軌道を計算した。
予測時刻が、ニュースとほんの少しだけ違う。` },
      { label: '望遠鏡を見つける', cost: 2, action: 'getTelescope', next: 'rooftop',
        hidden: s.items.includes('telescope'),
        result: () => `誰かが置き忘れた天体望遠鏡。三脚もそのまま。
レンズに少し埃がある。袖で拭いた。` },
      { label: '空をただ眺める', cost: 1, action: 'meditateRiver', next: 'rooftop',
        result: () => `風が強くなった。
赤い空に、何か白い線が走っている。飛行機ではない。
それを目で追い続けた。` },
      { label: '隕石について考える', cost: 2, action: 'checkPC', next: 'rooftop',
        result: () => `あれは何メートルあるのだろう。
ぶつかる速度は、秒速何キロなのだろう。
考えても何も変わらないが、考え続けた。` },
      { label: '職場フロアへ戻る', cost: 2, next: 'office' },
      { label: '病院へ向かう', cost: 2, next: 'hospital' },
    ],
  },

  // ─── 実家 ───
  parents: {
    id: 'parents',
    name: '実家',
    text: (s) => `実家のドアを開けると、カレーの匂いがした。
母が台所に立っていた。父は椅子で新聞を読んでいた。
テレビは音量を絞って隕石のニュースを流していた。${
  s.flags.calledParents ? '\nさっき電話したのに、来てしまった。でも来てよかった。' : ''
}`,
    choices: (s) => [
      { label: '母と話す', cost: 2, action: 'callParents', next: 'parents',
        result: () => `「ちゃんと食べてた?」と母が聞いた。
「食べてた」と答えた。嘘だった。
母は知っていて、それでも頷いた。` },
      { label: '父と話す', cost: 2, action: 'talkStranger', next: 'parents',
        result: () => `父は新聞を畳んで、「久しぶりだな」と言った。
ニュースは隕石を流し続けている。
それについては、触れなかった。` },
      { label: 'ただ一緒にいる', cost: 3, action: 'talkHomeless', next: 'parents',
        result: () => `誰も何も言わなかった。
台所からカレーの匂い、テレビの音、父のページをめくる音。
それで充分だった。` },
      { label: '電話する (来る前に)', cost: 1, action: 'callParents', next: 'parents',
        hidden: s.flags.calledParents,
        result: () => `「今から行ってもいい?」と聞いた。
「いつでもおいで」と母が言った。
電話が切れた後、しばらく動けなかった。` },
      { label: 'アパートへ戻る', cost: 5, next: 'apartment' },
    ],
  },
};
