#!/usr/bin/env node
// Delete one or more images from Cloudinary (admin helper)
// Usage:
//   export CLOUDINARY_URL='cloudinary://API_KEY:API_SECRET@cloud_name'
//   node admin/delete-image.js <public_id> [public_id2 ...] [--sync]

const { execSync } = require('child_process');
const args = process.argv.slice(2);

if(args.length===0){
  console.error('Usage: node admin/delete-image.js <public_id> [public_id2 ...] [--sync]');
  process.exit(1);
}

const doSyncIndex = args.includes('--sync');
const publicIds = args.filter(a => a !== '--sync');

let cloudinary;
try{
  cloudinary = require('cloudinary').v2;
}catch(e){
  console.error('Please install the cloudinary package: npm install cloudinary');
  process.exit(1);
}

// Ensure SDK reads CLOUDINARY_URL or env vars
if(!process.env.CLOUDINARY_URL && !(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME)){
  console.error('Missing Cloudinary credentials. Set CLOUDINARY_URL or CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET/CLOUDINARY_CLOUD_NAME.');
  process.exit(1);
}

(async ()=>{
  try{
    console.log('Deleting', publicIds.join(', '));
    // Use delete_resources for multiple ids
    const res = await cloudinary.api.delete_resources(publicIds, {resource_type:'image', type:'upload'});
    console.log('Cloudinary delete response:', res);
    // Optionally invalidate cached versions (useful if you used derived URLs) - cloudinary invalidation is per resource via uploader.destroy with invalidate:true
    // If you want to force CDN invalidation per-file, you could loop and call uploader.destroy(publicId, {invalidate:true})

    if(doSyncIndex){
      console.log('Rebuilding local data/gallery.json by running admin/fetch-gallery.js');
      try{
        execSync('node admin/fetch-gallery.js', {stdio:'inherit'});
      }catch(e){ console.error('Failed to run fetch-gallery.js', e.message); }
    }

    console.log('Done.');
  }catch(e){
    console.error('Delete failed:', e.message || e);
    process.exit(1);
  }
})();
