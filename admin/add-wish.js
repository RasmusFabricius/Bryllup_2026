#!/usr/bin/env node
// Simple Node admin script to append a wish to data/wishlist.json
// Usage: node admin/add-wish.js --title "Title" --description "..." --link "http://..."

const fs = require('fs');
const path = require('path');

function parseArgs(){
  const args = require('minimist')(process.argv.slice(2));
  return {title:args.title||args.t, description:args.description||args.d||'', link:args.link||args.l||''};
}

(async ()=>{
  const {title,description,link} = parseArgs();
  if(!title){
    console.error('Missing --title'); process.exit(1);
  }
  const file = path.join(__dirname,'..','data','wishlist.json');
  let list = [];
  try{ list = JSON.parse(fs.readFileSync(file,'utf8')) }catch(e){ /* start fresh */ }
  const id = (list.reduce((m,i)=>Math.max(m,i.id||0),0) || 0) +1;
  const wish = {id,title,description,link};
  list.push(wish);
  fs.writeFileSync(file,JSON.stringify(list,null,2),'utf8');
  console.log('Added wish:',wish);
})();
