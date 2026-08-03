const STORAGE_KEY="portfolio-monitor-local-v1";
const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const number=new Intl.NumberFormat("en-IN",{maximumFractionDigits:4});
const shortMoney=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",notation:"compact",maximumFractionDigits:2});
let portfolioData=null;
let charts={};
let selectedMonths=0;
let holdingSort={key:"market_value",direction:"desc"};

function n(value){const x=Number(value);return Number.isFinite(x)?x:0}
function round(value,digits=2){const p=10**digits;return Math.round((n(value)+Number.EPSILON)*p)/p}
function isoDate(value){
  if(value instanceof Date&&!Number.isNaN(value.valueOf()))return value.toISOString().slice(0,10);
  if(typeof value==="number"&&value>30000){const date=new Date(Date.UTC(1899,11,30));date.setUTCDate(date.getUTCDate()+Math.floor(value));return date.toISOString().slice(0,10)}
  if(typeof value==="string"&&value){const parsed=new Date(value);if(!Number.isNaN(parsed.valueOf()))return parsed.toISOString().slice(0,10)}
  return "";
}
function formatDate(value){if(!value)return"—";const date=new Date(`${value}`.length===10?`${value}T00:00:00`:value);return new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric"}).format(date)}
function formatDateTime(value){if(!value)return"—";const date=new Date(value);return new Intl.DateTimeFormat("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(date)}
function valueClass(value){return n(value)>=0?"positive":"negative"}
function setValue(id,text,className=""){const el=document.getElementById(id);el.textContent=text;el.classList.remove("positive","negative");if(className)el.classList.add(className)}
function destroyChart(name){if(charts[name]){charts[name].destroy();charts[name]=null}}
function sheetRows(workbook,name,headerRow=0){const sheet=workbook.Sheets[name];if(!sheet)throw new Error(`Required sheet not found: ${name}`);return XLSX.utils.sheet_to_json(sheet,{range:headerRow,defval:null,raw:true})}

function buildPortfolioData(workbook){
  const holdingsRows=sheetRows(workbook,"Holdings Summary",0).filter(row=>row.Scrip);
  const marketRows=sheetRows(workbook,"Market Analysis",14).filter(row=>row.Scrip);
  const transactionRows=sheetRows(workbook,"Transactions",0).filter(row=>row["Txn ID"]!=null&&row.Scrip);
  let closedRows=[];
  if(workbook.Sheets["Closed Trades"]){closedRows=sheetRows(workbook,"Closed Trades",3).filter(row=>row.Scrip&&String(row.Scrip).toLowerCase()!=="total realized p&l")}
  const marketBySymbol=new Map(marketRows.map(row=>[String(row.Scrip),row]));

  const holdings=holdingsRows.map(row=>{
    const symbol=String(row.Scrip);
    const market=marketBySymbol.get(symbol)||{};
    const cost=n(row["Open-Lot Cost"]);
    const qty=n(row["Current Qty"]);
    const price=n(market["Current Price"]);
    const marketValue=n(market["Market Value"])||qty*price;
    const unrealized=n(market["Unrealized P&L"])||(marketValue-cost);
    const dividends=n(row["Gross Dividends"]);
    const totalPnl=n(market["Total P&L incl. Div."])||(unrealized+dividends);
    return{
      symbol,
      sector:String(market.Sector||"Other"),
      quantity:qty,
      average_cost:n(row["Average Cost"])||(qty?cost/qty:0),
      cost_basis:cost,
      price,
      market_value:marketValue,
      unrealized_pnl:unrealized,
      unrealized_pct:cost?unrealized/cost*100:0,
      dividends,
      total_pnl:totalPnl,
      total_return_pct:cost?totalPnl/cost*100:0,
      price_date:isoDate(market["Price Date"])
    };
  });

  const marketValue=holdings.reduce((sum,row)=>sum+row.market_value,0);
  holdings.forEach(row=>row.weight_pct=marketValue?row.market_value/marketValue*100:0);

  const transactions=transactionRows.map(row=>({
    id:n(row["Txn ID"]),
    symbol:String(row.Scrip),
    date:isoDate(row["Transaction Date"]),
    side:String(row.Side),
    quantity:n(row.Qty),
    price:n(row["Avg Price"]),
    amount:n(row.Amount),
    section:String(row["Statement Section"]||""),
    type:String(row["Transaction Type"]||"Normal")
  })).filter(row=>row.date&&row.symbol);

  const daily=new Map();
  transactions.forEach(row=>{
    if(!daily.has(row.date))daily.set(row.date,{date:row.date,buy_amount:0,sell_amount:0,buy_count:0,sell_count:0});
    const item=daily.get(row.date);
    if(row.side==="Buy"){item.buy_amount+=row.amount;item.buy_count+=1}else{item.sell_amount+=row.amount;item.sell_count+=1}
  });
  let cumulative=0;
  const capitalTimeline=[...daily.values()].sort((a,b)=>a.date.localeCompare(b.date)).map(row=>{
    cumulative+=row.buy_amount-row.sell_amount;
    return{...row,buy_amount:round(row.buy_amount),sell_amount:round(row.sell_amount),cumulative_net_cash:round(cumulative)};
  });

  const costBasis=holdings.reduce((sum,row)=>sum+row.cost_basis,0);
  const unrealizedPnl=holdings.reduce((sum,row)=>sum+row.unrealized_pnl,0);
  const grossDividends=holdings.reduce((sum,row)=>sum+row.dividends,0);
  const realizedPnl=closedRows.reduce((sum,row)=>sum+n(row["Realized P&L"]),0);
  const openTotalPnl=unrealizedPnl+grossDividends;
  const priceDates=holdings.map(row=>row.price_date).filter(Boolean).sort();
  const asOf=priceDates.at(-1)||new Date().toISOString().slice(0,10);

  const previous=loadSavedData(false);
  let snapshots=previous?.snapshots||[];
  const snapshot={timestamp:`${asOf}T15:30:00+05:30`,invested_capital:round(costBasis),market_value:round(marketValue),unrealized_pnl:round(unrealizedPnl),day_high:null,day_low:null};
  snapshots=snapshots.filter(row=>row.timestamp!==snapshot.timestamp);
  snapshots.push(snapshot);
  snapshots.sort((a,b)=>a.timestamp.localeCompare(b.timestamp));

  return{
    meta:{mode:"local",as_of:snapshot.timestamp,price_source_note:"Imported from your Excel workbook and stored only in this browser."},
    summary:{
      cost_basis:round(costBasis),market_value:round(marketValue),unrealized_pnl:round(unrealizedPnl),
      unrealized_pct:costBasis?round(unrealizedPnl/costBasis*100):0,gross_dividends:round(grossDividends),
      open_total_pnl:round(openTotalPnl),open_total_return_pct:costBasis?round(openTotalPnl/costBasis*100):0,
      realized_pnl:round(realizedPnl),tracked_cumulative_gain:round(openTotalPnl+realizedPnl),
      holdings_count:holdings.length,transactions_count:transactions.length
    },
    snapshots,holdings,transactions,capital_timeline:capitalTimeline
  };
}

function saveData(data){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function loadSavedData(showError=true){try{const raw=localStorage.getItem(STORAGE_KEY);return raw?JSON.parse(raw):null}catch(error){if(showError)showStatus("Saved data could not be read",error.message,true);return null}}
function clearVisuals(){["capital","allocation","pnl","snapshots"].forEach(destroyChart);document.querySelector("#holdingsTable tbody").innerHTML="";document.querySelector("#transactionsTable tbody").innerHTML=""}
function showStatus(title,message,isError=false){const panel=document.getElementById("statusPanel");panel.classList.toggle("error-panel",isError);document.getElementById("statusTitle").textContent=title;document.getElementById("statusMessage").textContent=message}

async function importWorkbook(file){
  showStatus("Reading workbook","Processing the Excel file locally in your browser.");
  try{
    const buffer=await file.arrayBuffer();
    const workbook=XLSX.read(buffer,{type:"array",cellDates:true});
    portfolioData=buildPortfolioData(workbook);
    saveData(portfolioData);
    renderAll();
    showStatus("Workbook imported successfully",`${portfolioData.summary.holdings_count} holdings and ${portfolioData.summary.transactions_count} transactions are available. No financial data was uploaded to GitHub.`);
    document.getElementById("lastLoaded").textContent=`Imported ${new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}`;
  }catch(error){showStatus("Workbook import failed",error.message,true)}
}

function renderAll(){if(!portfolioData)return;renderStatus();renderSummary();populateFilters();renderCapitalChart();renderAllocationChart();renderPnlChart();renderSnapshotChart();renderHoldings();renderTransactions()}
function renderStatus(){document.getElementById("asOfLabel").textContent=formatDateTime(portfolioData.meta.as_of);document.getElementById("sourceNote").textContent=portfolioData.meta.price_source_note;document.getElementById("connectionBadge").textContent="Local snapshot"}
function renderSummary(){const s=portfolioData.summary;setValue("marketValue",money.format(s.market_value));setValue("costBasis",money.format(s.cost_basis));setValue("unrealizedPnl",money.format(s.unrealized_pnl),valueClass(s.unrealized_pnl));setValue("unrealizedPct",`${s.unrealized_pct>=0?"+":""}${s.unrealized_pct.toFixed(2)}%`,valueClass(s.unrealized_pct));setValue("dividends",money.format(s.gross_dividends));setValue("trackedGain",money.format(s.tracked_cumulative_gain),valueClass(s.tracked_cumulative_gain));setValue("marketValueDelta",`${s.holdings_count} holdings · ${s.transactions_count} transactions`);const latest=portfolioData.snapshots.at(-1);setValue("dayRange",latest?.day_high!=null&&latest?.day_low!=null?`${shortMoney.format(latest.day_high)} / ${shortMoney.format(latest.day_low)}`:"Not collected")}
function filteredTimeline(){const rows=[...portfolioData.capital_timeline];if(!selectedMonths||!rows.length)return rows;const latest=new Date(rows.at(-1).date);const cutoff=new Date(latest);cutoff.setMonth(cutoff.getMonth()-selectedMonths);return rows.filter(row=>new Date(row.date)>=cutoff)}

function renderCapitalChart(){
  destroyChart("capital");const rows=filteredTimeline();if(!rows.length)return;
  const marker=rows.map((_,index)=>index===rows.length-1?portfolioData.summary.market_value:null);
  charts.capital=new Chart(document.getElementById("capitalChart"),{data:{labels:rows.map(row=>row.date),datasets:[
    {type:"line",label:"Cumulative net cash deployed",data:rows.map(row=>row.cumulative_net_cash),borderColor:"#245b8f",backgroundColor:"rgba(36,91,143,.10)",fill:true,pointRadius:0,borderWidth:2,tension:.18,yAxisID:"cash"},
    {type:"bar",label:"Daily buys",data:rows.map(row=>row.buy_amount),backgroundColor:"rgba(19,138,91,.45)",borderColor:"#138a5b",borderWidth:1,yAxisID:"activity"},
    {type:"bar",label:"Daily sells",data:rows.map(row=>-row.sell_amount),backgroundColor:"rgba(201,73,73,.42)",borderColor:"#c94949",borderWidth:1,yAxisID:"activity"},
    {type:"line",label:"Latest market value",data:marker,showLine:false,pointRadius:7,pointBackgroundColor:"#d0a85c",pointBorderColor:"#10233f",pointBorderWidth:2,yAxisID:"cash"}
  ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:"index",intersect:false},plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8}},tooltip:{callbacks:{title:items=>formatDate(items[0].label),label:ctx=>`${ctx.dataset.label}: ${money.format(Math.abs(ctx.raw||0))}`}}},scales:{x:{grid:{display:false},ticks:{maxTicksLimit:12}},cash:{position:"left",ticks:{callback:value=>shortMoney.format(value)}},activity:{position:"right",grid:{drawOnChartArea:false},ticks:{callback:value=>shortMoney.format(Math.abs(value))}}}}})
}
function renderAllocationChart(){destroyChart("allocation");const sectors={};portfolioData.holdings.forEach(row=>sectors[row.sector]=(sectors[row.sector]||0)+row.market_value);charts.allocation=new Chart(document.getElementById("allocationChart"),{type:"doughnut",data:{labels:Object.keys(sectors),datasets:[{data:Object.values(sectors),backgroundColor:["#245b8f","#2b8580","#d0a85c","#7b6ba8","#c56e4b","#6b8e62"],borderColor:"#fff",borderWidth:3}]},options:{responsive:true,maintainAspectRatio:false,cutout:"62%",plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:9}},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${money.format(ctx.raw)} (${(ctx.raw/portfolioData.summary.market_value*100).toFixed(1)}%)`}}}}})}
function renderPnlChart(){destroyChart("pnl");const rows=[...portfolioData.holdings].sort((a,b)=>b.total_pnl-a.total_pnl);charts.pnl=new Chart(document.getElementById("pnlChart"),{type:"bar",data:{labels:rows.map(row=>row.symbol),datasets:[{data:rows.map(row=>row.total_pnl),backgroundColor:rows.map(row=>row.total_pnl>=0?"rgba(19,138,91,.62)":"rgba(201,73,73,.62)"),borderColor:rows.map(row=>row.total_pnl>=0?"#138a5b":"#c94949"),borderWidth:1}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>money.format(ctx.raw)}}},scales:{x:{ticks:{callback:value=>shortMoney.format(value)}},y:{grid:{display:false}}}}})}
function renderSnapshotChart(){destroyChart("snapshots");const rows=portfolioData.snapshots||[];document.getElementById("snapshotNote").textContent=rows.length>1?`${rows.length} workbook snapshots are stored in this browser.`:"Upload a later workbook to add another point. Live intraday points will begin after the private collector is connected.";charts.snapshots=new Chart(document.getElementById("snapshotChart"),{type:"line",data:{labels:rows.map(row=>row.timestamp),datasets:[{label:"Portfolio market value",data:rows.map(row=>row.market_value),borderColor:"#2b8580",backgroundColor:"rgba(43,133,128,.10)",pointRadius:5,borderWidth:2,fill:true},{label:"Invested capital",data:rows.map(row=>row.invested_capital),borderColor:"#7b6ba8",borderDash:[6,5],pointRadius:4,borderWidth:2}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{usePointStyle:true,boxWidth:8}},tooltip:{callbacks:{title:items=>formatDateTime(items[0].label),label:ctx=>`${ctx.dataset.label}: ${money.format(ctx.raw)}`}}},scales:{x:{grid:{display:false},ticks:{callback:(_,i)=>formatDate(rows[i]?.timestamp)}},y:{ticks:{callback:value=>shortMoney.format(value)}}}}})}

function populateFilters(){const select=document.getElementById("symbolFilter");const current=select.value;const symbols=[...new Set(portfolioData.transactions.map(row=>row.symbol))].sort();select.innerHTML='<option value="">All stocks</option>'+symbols.map(symbol=>`<option value="${symbol}">${symbol}</option>`).join("");select.value=current}
function renderHoldings(){const query=document.getElementById("holdingSearch").value.trim().toLowerCase();const rows=portfolioData.holdings.filter(row=>!query||row.symbol.toLowerCase().includes(query)||row.sector.toLowerCase().includes(query)).sort((a,b)=>{const av=a[holdingSort.key],bv=b[holdingSort.key];const cmp=typeof av==="string"?av.localeCompare(bv):n(av)-n(bv);return holdingSort.direction==="asc"?cmp:-cmp});document.querySelector("#holdingsTable tbody").innerHTML=rows.map(row=>`<tr><td><span class="symbol">${row.symbol}</span></td><td><span class="sector">${row.sector}</span></td><td>${number.format(row.quantity)}</td><td>${money.format(row.average_cost)}</td><td>${money.format(row.price)}</td><td>${money.format(row.market_value)}</td><td class="${valueClass(row.unrealized_pnl)}">${money.format(row.unrealized_pnl)}</td><td class="${valueClass(row.total_return_pct)}">${row.total_return_pct>=0?"+":""}${row.total_return_pct.toFixed(2)}%</td><td>${row.weight_pct.toFixed(2)}%</td></tr>`).join("")}
function renderTransactions(){const symbol=document.getElementById("symbolFilter").value;const side=document.getElementById("sideFilter").value;const limit=n(document.getElementById("limitFilter").value);const rows=portfolioData.transactions.filter(row=>(!symbol||row.symbol===symbol)&&(!side||row.side===side)).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id).slice(0,limit);document.querySelector("#transactionsTable tbody").innerHTML=rows.map(row=>`<tr><td>${formatDate(row.date)}</td><td><span class="symbol">${row.symbol}</span></td><td><span class="side-pill ${row.side==="Buy"?"side-buy":"side-sell"}">${row.side}</span></td><td>${number.format(row.quantity)}</td><td>${money.format(row.price)}</td><td>${money.format(row.amount)}</td><td>${row.type}</td></tr>`).join("")}

function loadFromBrowser(){portfolioData=loadSavedData();if(portfolioData){renderAll();showStatus("Saved browser snapshot loaded","Import a newer workbook whenever you want to update holdings, prices or transactions.");document.getElementById("lastLoaded").textContent="Loaded from this browser"}else{clearVisuals();showStatus("Import the portfolio workbook","Choose the workbook created from your Angel One statements. It will be processed locally and will not be uploaded to GitHub.")}}

document.getElementById("workbookInput").addEventListener("change",event=>{const file=event.target.files?.[0];if(file)importWorkbook(file);event.target.value=""});
document.getElementById("clearButton").addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);portfolioData=null;clearVisuals();["marketValue","costBasis","unrealizedPnl","unrealizedPct","dividends","trackedGain"].forEach(id=>setValue(id,"—"));setValue("marketValueDelta","Current holdings");setValue("dayRange","Not collected");document.getElementById("asOfLabel").textContent="No workbook imported";document.getElementById("sourceNote").textContent="Your financial data stays inside this browser.";showStatus("Browser data cleared","Import the workbook again to rebuild the dashboard.");document.getElementById("lastLoaded").textContent="Waiting for data"});
document.getElementById("refreshButton").addEventListener("click",loadFromBrowser);
document.getElementById("holdingSearch").addEventListener("input",()=>portfolioData&&renderHoldings());
["symbolFilter","sideFilter","limitFilter"].forEach(id=>document.getElementById(id).addEventListener("change",()=>portfolioData&&renderTransactions()));
document.querySelectorAll("#holdingsTable th[data-sort]").forEach(header=>header.addEventListener("click",()=>{const key=header.dataset.sort;if(holdingSort.key===key)holdingSort.direction=holdingSort.direction==="asc"?"desc":"asc";else holdingSort={key,direction:key==="symbol"||key==="sector"?"asc":"desc"};if(portfolioData)renderHoldings()}));
document.querySelectorAll(".range-button").forEach(button=>button.addEventListener("click",()=>{selectedMonths=n(button.dataset.months);document.querySelectorAll(".range-button").forEach(item=>item.classList.remove("active"));button.classList.add("active");if(portfolioData)renderCapitalChart()}));
loadFromBrowser();