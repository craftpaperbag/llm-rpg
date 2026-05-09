export const characters = {
  tsubaki: {
    id: 'tsubaki',
    name: 'ツバキ',
    icon: '🌸',
    description: `隣の部屋に住んでいる女性。ベランダで洗濯物を取り込んでいた。
「今日は雨かな」と、何でもないことのようにつぶやく。
何ひとつ重大なことを言わず、何ひとつ軽くもなかった。`,
    met: (s) => s.visited.includes('apartment_balcony'),
  },
  nagi: {
    id: 'nagi',
    name: 'ナギさん',
    icon: '🏪',
    description: `コンビニの店員。いらっしゃいませの抑揚が、いつも同じ高さで終わる。
無表情の奥で、レジを開ける指先だけが、わずかに震えていた。
震えない指のために、震えていた指を覚えている。`,
    met: (s) => s.visited.includes('convenience'),
  },
  tetsu: {
    id: 'tetsu',
    name: 'テツ',
    icon: '📒',
    description: `コンビニの外、段ボールに座っている男。歯が三本欠けた笑い方をする。
コートの内ポケットには、年代を消し続けた変色した手帳。
空を指さすときの目は、白目の縁が黄色くなっていた。`,
    met: (s) => !!s.flags.talkedHomeless || !!s.flags.gaveCoffee || !!s.flags.tetsuTold,
  },
  kanata: {
    id: 'kanata',
    name: 'カナタ',
    icon: '🌿',
    description: `母校の校庭で、ひとり桜を見上げていたかつての同級生。
「終わるのに咲くなんて、馬鹿みたいだよね」と笑った。
卒業アルバムには「またね」と書いていた人。`,
    met: (s) => !!s.flags.metClassmate,
  },
  haru: {
    id: 'haru',
    name: 'ハル',
    icon: '🐕',
    description: `駅前ロータリーで迷子になっていた犬。首輪に名前があった。
番号にかけると、すぐに飼い主が走ってきた。
尻尾は最後まで止まらなかった。`,
    met: (s) => !!s.flags.foundDog,
  },
  murase: {
    id: 'murase',
    name: 'ムラセ部長',
    icon: '💼',
    description: `終わらない会議の主。「Q4予算配分について」と話し続けている。
スライドの前で、いつまでも振り向かない背中をしている。
見ている方向が、ここではないどこかだということだけはわかった。`,
    met: (s) => s.visited.includes('office'),
  },
  jou: {
    id: 'jou',
    name: 'ジョウ神主',
    icon: '🎋',
    description: `古い神社の老神主。隕石の話には触れない。
落ち葉を一枚ずつ、いつもの日と同じ手つきで掃いている。
「無ですなあ」と、聞こえたような気がする声で言う。`,
    met: (s) => s.visited.includes('shrine'),
  },
  mio: {
    id: 'mio',
    name: 'ミオさん',
    icon: '🏥',
    description: `総合病院の看護師。無駄な動きが一つもない。
シーツを替え、水を運び、雑談に付き合う。
「ありがとう」が、ちゃんと届く声で言える人。`,
    met: (s) => !!s.flags.helpedHospital,
  },
  parents: {
    id: 'parents',
    name: '両親',
    icon: '🍛',
    description: `カレーの匂いと、新聞をめくる音。
母は台所に、父は椅子に。テレビは音量を絞って隕石のニュースを流していた。
何年もかけて、ただ待っていてくれた二人。`,
    met: (s) => s.visited.includes('parents') || !!s.flags.calledParents,
  },
  speaker: {
    id: 'speaker',
    name: '演説者',
    icon: '📢',
    description: `駅前ロータリーで拡声器を握る男。「神の怒りだ！」と叫び続ける。
「あなたも罪を悔い改めなさい!」——拡声器越しの声が耳に刺さる。
何の罪のことなのかは、本人にもわからないのかもしれない。`,
    met: (s) => s.visited.includes('station'),
  },
};

export function getCharacter(id) {
  return characters[id] ?? { id, name: id, icon: '▪', description: '——', met: () => false };
}

export function getMetCharacters(state) {
  return Object.values(characters).filter(c => c.met(state));
}
