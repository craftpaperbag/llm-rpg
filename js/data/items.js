export const items = {
  key_home: { id: 'key_home', name: '実家の鍵', icon: '🔑' },
  note:     { id: 'note',     name: '母からの未読LINE', icon: '📱' },
  coffee:   { id: 'coffee',   name: '缶コーヒー', icon: '☕' },
  photo:    { id: 'photo',    name: '古い写真', icon: '🖼' },
  omamori:  { id: 'omamori',  name: 'お守り', icon: '🎋' },
  telescope:{ id: 'telescope',name: '望遠鏡', icon: '🔭' },
  paper:    { id: 'paper',    name: '研究論文の切れ端', icon: '📄' },
};

export function getItem(id) {
  return items[id] ?? { id, name: id, icon: '▪' };
}
