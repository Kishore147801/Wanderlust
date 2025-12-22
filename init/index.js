const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const newData = require("./data.js");

main().then(()=>{
    console.log("Connected to DB");
}).catch((err)=>{
    console.log(err);
});
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
};

const initData = async ()=>{
    await Listing.deleteMany({});
    const seedData = newData.data.map((obj)=>({...obj,owner:"6925de7a241e4281985263b2"}));
    await Listing.insertMany(seedData);
    console.log("Data was initialized");
};

initData();