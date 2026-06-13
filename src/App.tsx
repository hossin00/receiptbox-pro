import { useState } from 'react';
import { Receipt, Plus, Trash2, Download, Search, X } from 'lucide-react';
import { format } from 'date-fns';

interface ReceiptItem { id:string; merchant:string; amount:number; category:string; date:string; notes:string; createdAt:number; }
const CATS=['🍔 Food','🚗 Transport','🛍 Shopping','💊 Health','🏠 Home','🎭 Entertainment','✈️ Travel','💼 Business','📚 Education','💸 Other'];
const SAVE='rb_receipts_v1';
const loadR = ():ReceiptItem[] => { try{ return JSON.parse(localStorage.getItem(SAVE)||'[]'); }catch{ return []; } };

export default function App() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>(loadR);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('All');
  const [showAdd,  setShowAdd]  = useState(false);
  const [editItem, setEditItem] = useState<ReceiptItem|null>(null);

  const save = (items: ReceiptItem[]) => { setReceipts(items); localStorage.setItem(SAVE, JSON.stringify(items)); };

  const filtered = receipts.filter(r => {
    const ms = !search || r.merchant.toLowerCase().includes(search.toLowerCase()) || r.notes.toLowerCase().includes(search.toLowerCase());
    const mc = filter === 'All' || r.category === filter;
    return ms && mc;
  });

  const total = receipts.reduce((s,r) => s + r.amount, 0);
  const thisMonth = receipts.filter(r => r.date.startsWith(new Date().toISOString().slice(0,7))).reduce((s,r) => s + r.amount, 0);
  const byCat = CATS.map(c => ({ cat:c, total: receipts.filter(r => r.category===c).reduce((s,r) => s+r.amount, 0) })).filter(x => x.total > 0).sort((a,b) => b.total - a.total).slice(0,5);

  const exportCSV = () => {
    const header = 'Date,Merchant,Category,Amount,Notes';
    const rows = receipts.map(r => [r.date, r.merchant, r.category, String(r.amount), r.notes].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'receipts.csv'; a.click();
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0f0a00', display:'flex', flexDirection:'column' }}>
      <header style={{ padding:'16px 20px', borderBottom:'1px solid #451a0320', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'linear-gradient(135deg,#f59e0b,#d97706)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px #f59e0b30' }}><Receipt size={16} color="white"/></div>
          <div>
            <div style={{ fontWeight:'700', fontSize:'16px', color:'white', lineHeight:1 }}>ReceiptBox Pro</div>
            <div style={{ fontSize:'11px', color:'#92400e', marginTop:'2px' }}>{receipts.length} receipts tracked</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:'4px' }}>
          <button onClick={exportCSV} style={{ padding:'7px', borderRadius:'7px', background:'none', border:'none', cursor:'pointer', color:'#92400e' }}><Download size={15}/></button>
          <button onClick={() => { setEditItem(null); setShowAdd(true); }} style={{ display:'flex', alignItems:'center', gap:'5px', padding:'8px 14px', borderRadius:'9px', background:'#f59e0b', border:'none', color:'white', fontSize:'13px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter', boxShadow:'0 4px 12px #f59e0b30' }}>
            <Plus size={13}/> Add
          </button>
        </div>
      </header>

      <div style={{ flex:1, overflow:'auto', padding:'16px 20px' }}>
        {receipts.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
            <div style={{ background:'#1a1000', border:'1px solid #451a0320', borderRadius:'10px', padding:'14px' }}>
              <div style={{ fontSize:'18px', fontWeight:'700', color:'#fcd34d' }}>${total.toFixed(2)}</div>
              <div style={{ fontSize:'10px', color:'#92400e', marginTop:'2px' }}>Total recorded</div>
            </div>
            <div style={{ background:'#1a1000', border:'1px solid #451a0320', borderRadius:'10px', padding:'14px' }}>
              <div style={{ fontSize:'18px', fontWeight:'700', color:'#f59e0b' }}>${thisMonth.toFixed(2)}</div>
              <div style={{ fontSize:'10px', color:'#92400e', marginTop:'2px' }}>This month</div>
            </div>
          </div>
        )}

        {byCat.length > 0 && (
          <div style={{ background:'#1a1000', border:'1px solid #451a0320', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
            <div style={{ fontSize:'12px', color:'#92400e', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'10px' }}>Top Categories</div>
            {byCat.map(({ cat, total:t }) => (
              <div key={cat} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
                <span style={{ fontSize:'13px', color:'#fcd34d' }}>{cat}</span>
                <span style={{ fontSize:'13px', fontWeight:'600', color:'#f59e0b' }}>${t.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ position:'relative', marginBottom:'10px' }}>
          <Search size={13} style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', color:'#92400e' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search receipts…"
            style={{ width:'100%', background:'#1a1000', border:'1px solid #451a0320', borderRadius:'10px', padding:'9px 12px 9px 34px', color:'white', fontSize:'13px', outline:'none', fontFamily:'Inter' }}
            onFocus={e => e.target.style.borderColor='#f59e0b'} onBlur={e => e.target.style.borderColor='#451a0320'}/>
        </div>

        <div style={{ display:'flex', gap:'6px', overflowX:'auto', marginBottom:'14px', paddingBottom:'2px' }}>
          {['All', ...CATS].map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{ flexShrink:0, padding:'4px 12px', borderRadius:'20px', border:`1px solid ${filter===c?'#f59e0b':'#451a0320'}`, background:filter===c?'#f59e0b15':'transparent', color:filter===c?'#fcd34d':'#92400e', fontSize:'12px', cursor:'pointer', fontFamily:'Inter', whiteSpace:'nowrap' }}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ fontSize:'52px', marginBottom:'16px' }}>🧾</div>
            <h3 style={{ fontSize:'20px', fontWeight:'700', color:'white', marginBottom:'8px' }}>{receipts.length === 0 ? 'Add your first receipt' : 'No matches'}</h3>
            <p style={{ color:'#92400e', fontSize:'14px', lineHeight:'1.6', maxWidth:'240px', margin:'0 auto 24px' }}>
              {receipts.length === 0 ? 'Track every expense by adding receipts manually.' : 'Try a different search or category.'}
            </p>
            {receipts.length === 0 && (
              <button onClick={() => setShowAdd(true)} style={{ padding:'12px 24px', borderRadius:'10px', background:'#f59e0b', border:'none', color:'white', fontSize:'14px', fontWeight:'600', cursor:'pointer', fontFamily:'Inter', boxShadow:'0 4px 16px #f59e0b30' }}>Add first receipt</button>
            )}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
            {[...filtered].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => (
              <div key={r.id} style={{ background:'#1a1000', border:'1px solid #451a0320', borderRadius:'12px', padding:'13px', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', transition:'all 0.2s' }}
                onClick={() => { setEditItem(r); setShowAdd(true); }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#f59e0b25'} onMouseLeave={e => e.currentTarget.style.borderColor='#451a0320'}>
                <div style={{ width:'38px', height:'38px', borderRadius:'9px', background:'#f59e0b15', border:'1px solid #f59e0b20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', flexShrink:0 }}>
                  {r.category.split(' ')[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'white', fontSize:'13px', fontWeight:'500', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.merchant}</div>
                  <div style={{ color:'#92400e', fontSize:'11px', marginTop:'2px' }}>{format(new Date(r.date), 'MMM d, yyyy')} · {r.category.split(' ').slice(1).join(' ')}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                  <span style={{ fontSize:'14px', fontWeight:'700', color:'#fcd34d' }}>${r.amount.toFixed(2)}</span>
                  <button onClick={e => { e.stopPropagation(); save(receipts.filter(x => x.id !== r.id)); }} style={{ padding:'4px', background:'none', border:'none', cursor:'pointer', color:'#92400e' }}><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <ReceiptModal receipt={editItem}
          onSave={r => { const u = receipts.find(x => x.id===r.id) ? receipts.map(x => x.id===r.id?r:x) : [r, ...receipts]; save(u); setShowAdd(false); setEditItem(null); }}
          onClose={() => { setShowAdd(false); setEditItem(null); }} />
      )}
    </div>
  );
}

function ReceiptModal({ receipt, onSave, onClose }: { receipt:ReceiptItem|null; onSave:(r:ReceiptItem)=>void; onClose:()=>void }) {
  const [merchant, setMerchant] = useState(receipt?.merchant || '');
  const [amount,   setAmount]   = useState(receipt?.amount.toString() || '');
  const [cat,      setCat]      = useState(receipt?.category || '💸 Other');
  const [date,     setDate]     = useState(receipt?.date || new Date().toISOString().split('T')[0]);
  const [notes,    setNotes]    = useState(receipt?.notes || '');

  const inp = { width:'100%', background:'#0f0a00', border:'1px solid #451a0320', borderRadius:'10px', padding:'11px 14px', color:'white', fontSize:'14px', outline:'none', fontFamily:'Inter', transition:'border-color 0.2s' };

  const submit = () => {
    if (!merchant.trim() || !amount) return;
    onSave({ id: receipt?.id || crypto.randomUUID(), merchant: merchant.trim(), amount: parseFloat(amount), category: cat, date, notes: notes.trim(), createdAt: receipt?.createdAt || Date.now() });
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'#00000080', zIndex:50, display:'flex', alignItems:'flex-end' }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width:'100%', background:'#1a1000', borderRadius:'20px 20px 0 0', border:'1px solid #451a0320', borderBottom:'none', padding:'24px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ width:'36px', height:'3px', background:'#451a03', borderRadius:'2px', margin:'0 auto 20px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
          <h3 style={{ color:'white', fontSize:'16px', fontWeight:'700', fontFamily:'Inter' }}>{receipt ? 'Edit Receipt' : 'Add Receipt'}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#92400e' }}><X size={16}/></button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <input value={merchant} onChange={e => setMerchant(e.target.value)} placeholder="Merchant / Store *" style={inp} autoFocus onFocus={e => e.target.style.borderColor='#f59e0b'} onBlur={e => e.target.style.borderColor='#451a0320'}/>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount *" style={inp} onFocus={e => e.target.style.borderColor='#f59e0b'} onBlur={e => e.target.style.borderColor='#451a0320'}/>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {CATS.map(c => <button key={c} onClick={() => setCat(c)} style={{ padding:'5px 10px', borderRadius:'20px', border:`1px solid ${cat===c?'#f59e0b':'#451a0320'}`, background:cat===c?'#f59e0b15':'transparent', color:cat===c?'#fcd34d':'#92400e', fontSize:'12px', cursor:'pointer', fontFamily:'Inter' }}>{c}</button>)}
          </div>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inp} onFocus={e => e.target.style.borderColor='#f59e0b'} onBlur={e => e.target.style.borderColor='#451a0320'}/>
          <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" style={inp} onFocus={e => e.target.style.borderColor='#f59e0b'} onBlur={e => e.target.style.borderColor='#451a0320'}/>
          <button onClick={submit} disabled={!merchant.trim() || !amount}
            style={{ padding:'14px', borderRadius:'12px', background: !merchant.trim()||!amount ? '#451a03' : '#f59e0b', border:'none', color:'white', fontSize:'15px', fontWeight:'700', cursor: !merchant.trim()||!amount ? 'not-allowed' : 'pointer', fontFamily:'Inter', opacity: !merchant.trim()||!amount ? 0.5 : 1 }}>
            {receipt ? 'Save Changes' : 'Add Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
}
