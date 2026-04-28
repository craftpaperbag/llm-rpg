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
        hidden: s.flags.checkedFridge },
      { label: 'PCで隕石情報を調べる', cost: 2, action: 'checkPC', next: 'apartment',
        hidden: s.flags.checkedPC },
      { label: s.flags.noteOpened ? 'LINEを読み返す' : '母からの未読LINEを開く',
        cost: 1, action: 'openNote', next: 'apartment',
        hidden: s.flags.noteOpened && !s.items.includes('note') },
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
隣の部屋の住人が洗濯物を取り込んでいた。
「今日は雨かな」と彼女はつぶやいた。
隕石のことは言わなかった。主人公も言わなかった。`,
    choices: () => [
      { label: '隣の住人に声をかける', cost: 2, action: 'talkStranger', next: 'apartment_balcony' },
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
  s.flags.stoppedRobber ? '\nさっきの一件で、店員の田中さんとは顔見知りになった。' : ''
}${
  s.flags.gaveCoffee ? '\nホームレスの男性の姿はもうない。' : ''
}
棚にはほとんど何も残っていなかった。水と、おでんと、缶コーヒーだけ。`,
    choices: (s) => [
      { label: '缶コーヒーを買う (¥120)', cost: 2, action: 'buyCoffee', next: 'convenience',
        hidden: s.items.includes('coffee') || s.flags.gaveCoffee },
      { label: 'ビールを買う', cost: 1, action: 'buyBeer', next: 'convenience' },
      { label: '強盗を止める', cost: 3, action: 'stopRobber', next: 'convenience',
        hidden: s.flags.stoppedRobber,
        if: (s) => !s.flags.stoppedRobber },
      { label: 'レジから金を盗る', cost: 2, action: 'robRegister', next: 'convenience',
        hidden: s.flags.looted },
      { label: '店の外のホームレスに話しかける', cost: 2, action: 'talkHomeless', next: 'convenience',
        hidden: s.flags.gaveCoffee },
      { label: 'ホームレスに缶コーヒーを渡す', cost: 1, action: 'giveCoffee', next: 'convenience',
        if: (s) => s.items.includes('coffee') && !s.flags.gaveCoffee },
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
      { label: '演説する人に話しかける', cost: 2, action: 'talkPreacher', next: 'station' },
      { label: '迷子の犬を保護する', cost: 2, action: 'talkDog', next: 'station',
        hidden: s.flags.foundDog },
      { label: '見知らぬ人と話す', cost: 2, action: 'talkStranger', next: 'station' },
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
    ? '\n同級生の姿はもう見えない。でも何か残った気がする。'
    : '\n遠くに見覚えのある後ろ姿がある。'
}`,
    choices: (s) => [
      { label: '同級生に声をかける', cost: 3, action: 'talkClassmate', next: 'school',
        hidden: s.flags.metClassmate },
      { label: '卒業アルバムを探す', cost: 2, action: 'checkYearbook', next: 'school',
        if: (s) => s.items.includes('photo') },
      { label: '校庭で空を見上げる', cost: 1, action: 'meditateRiver', next: 'school' },
      { label: '駅前へ戻る', cost: 5, next: 'station' },
      { label: '職場へ向かう', cost: 5, next: 'office' },
    ],
  },

  // ─── 職場ビル ───
  office: {
    id: 'office',
    name: '職場ビル',
    text: (s) => `エレベーターは動いていた。社員証がまだ使えた。
会議室では部長がまだ会議をしていた。スライドには「Q4予算計画」と書いてある。${
  s.flags.attendedMeeting ? '\n会議は今も続いている。終わる気配がない。' : ''
}`,
    choices: (s) => [
      { label: '会議に参加する', cost: 3, action: 'sitInMeeting', next: 'office' },
      { label: '部長の財布から抜く', cost: 2, action: 'stealBoss', next: 'office',
        hidden: s.flags.looted },
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
老神主が境内を掃き掃除している。隕石? 知ったことではないというような顔だ。${
  count >= 1 ? `\n瞑想回数: ${count}回。心が少し軽くなった気がする。` : ''
}${
  s.items.includes('omamori') ? '\nお守りが手の中で温かい。' : ''
}`;
    },
    choices: (s) => [
      { label: '瞑想する', cost: 3, action: 'meditate', next: 'shrine' },
      { label: 'お守りをもらう', cost: 2, action: 'getOmamori', next: 'shrine',
        hidden: s.items.includes('omamori') },
      { label: '賽銭箱を蹴る', cost: 2, action: 'kickBox', next: 'shrine',
        hidden: s.flags.looted },
      { label: '神主と話す', cost: 2, action: 'talkPreacher', next: 'shrine' },
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
      { label: 'バンドの演奏を聴く', cost: 2, action: 'watchBand', next: 'riverbed' },
      { label: 'バンドと一緒に歌う', cost: 3, action: 'joinBand', next: 'riverbed',
        hidden: s.flags.joinedBand },
      { label: '河川敷で一人で空を見る', cost: 1, action: 'meditateRiver', next: 'riverbed' },
      { label: '空に向かって叫ぶ', cost: 2, action: 'yell', next: 'riverbed' },
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
  s.flags.helpedHospital ? '\n看護師さんが「ありがとう」と言った。ちゃんと聞こえた。' : ''
}${
  s.items.includes('paper') ? '\n研究論文の切れ端が、ポケットの中で折りたたまれている。' : ''
}`,
    choices: (s) => [
      { label: '看護師の手伝いをする', cost: 4, action: 'helpNurse', next: 'hospital',
        hidden: s.flags.helpedHospital },
      { label: '待合室の患者と話す', cost: 2, action: 'talkStranger', next: 'hospital' },
      { label: '廊下に落ちていた論文を拾う', cost: 1, action: 'getPaper', next: 'hospital',
        hidden: s.items.includes('paper') },
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
        if: (s) => s.items.includes('telescope') },
      { label: '望遠鏡を見つける', cost: 2, action: 'getTelescope', next: 'rooftop',
        hidden: s.items.includes('telescope') },
      { label: '空をただ眺める', cost: 1, action: 'meditateRiver', next: 'rooftop' },
      { label: '隕石について考える', cost: 2, action: 'checkPC', next: 'rooftop' },
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
      { label: '母と話す', cost: 2, action: 'callParents', next: 'parents' },
      { label: '父と話す', cost: 2, action: 'talkStranger', next: 'parents' },
      { label: 'ただ一緒にいる', cost: 3, action: 'talkHomeless', next: 'parents' },
      { label: '電話する (来る前に)', cost: 1, action: 'callParents', next: 'parents',
        hidden: s.flags.calledParents },
      { label: 'アパートへ戻る', cost: 5, next: 'apartment' },
    ],
  },
};
