const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

// module.exports.index = async (req,res)=>{
//     let allListings = await Listing.find({});
//     //console.log(allListings);
//     res.render("listings/index.ejs",{allListings});

// }

module.exports.index = async (req, res) => {
    let { q } = req.query; // Extract the search query 'q' from the URL
    let allListings;

    if (q) {
        // Use a Regular Expression for a "fuzzy" case-insensitive search
        // This will search both title and location fields
        allListings = await Listing.find({
            $or: [
                { title: { $regex: q, $options: "i" } },
                { location: { $regex: q, $options: "i" } },
                { country: { $regex: q, $options: "i" } }
            ]
        });
    } else {
        // Default behavior: fetch all listings if no search query exists
        allListings = await Listing.find({});
    }

    res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req,res)=>{
    //console.log(req.user);
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res)=>{
    let{id}=req.params;
    const listing = await Listing.findById(id).populate({path:"reviews",populate:{path:"author"}}).populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    };
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async (req,res,next)=>{
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1,
    })
    .send();

    let url = req.file.url;
    let filename = req.file.public_id;
    //console.log(url,"..",filename);

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url,filename};
    newListing.geometry = response.body.features[0].geometry;

    let savedListing = await newListing.save();
    console.log(savedListing);
    req.flash("success","New Listing Created!");
    res.redirect("/listings");

    //  Check if the file object exists
    // console.log(req.file);
    // if (req.file) {
    //     let url = req.file.url;
    //     let filename = req.file.display_name;

    //     // This will print the correct URL and filename if a file was uploaded
    //     console.log("File Uploaded Successfully:");
    //     console.log("URL:", url);
    //     console.log("Filename:", filename);
        
    //     // You should now integrate these variables into your listing object:
    //     // req.body.listing.image = { url, filename };

    // } else {
    //     // This will now print if the user submitted the form without a file
    //     console.log("No file uploaded. req.file is undefined.");
    // }
    
    // // ... Rest of your logic to create the new listing and save it to the DB ...
    
    // req.flash("success", "New Listing Created!");
    // res.redirect("/listings");

    // res.redirect("/listings");
    //let {title,description,price,location,country} = req.body;
    //let listing = req.body.listing;

    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listing");
    // }

    // let result = listingSchema.validate(req.body);  
    // console.log(result);
    // if(result.error){
    //     throw new ExpressError(400, result.error);
    // }

    // const newListing =new Listing(req.body.listing);
    // console.log(req.user);
    // newListing.owner = req.user._id;
    // newListing.image = {url,filename}
    // await newListing.save();
    // if(!newListing.title){
    //     throw new ExpressError(400,"Title is missing");
    // }

    // if(!newListing.description){
    //     throw new ExpressError(400,"Description is missing");
    // }

    // if(!newListing.price){
    //     throw new ExpressError(400,"Price is missing");
    // }

    // if(!newListing.country){
    //     throw new ExpressError(400,"Country is missing");
    // }

    // if(!newListing.location){
    //     throw new ExpressError(400,"Location is missing");
    // }
}

module.exports.renderEditForm = async (req,res)=>{
    let {id}= req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing you requested for does not exist!");
        return res.redirect("/listings");
    };
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // 1. Update the basic fields (title, description, price, etc.)
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // 2. Handle Location/Coordinates Update
    if (req.body.listing.location) {
        let response = await geocodingClient
            .forwardGeocode({
                query: req.body.listing.location,
                limit: 1,
            })
            .send();

        // Update the geometry (coordinates) based on the new location string
        listing.geometry = response.body.features[0].geometry;
    }

    // 3. Handle Image Update (if a new file is uploaded)
    if (typeof req.file !== "undefined") {
        let url = req.file.url;
        let filename = req.file.public_id;
        listing.image = { url, filename };
    }

    // 4. Save the updated listing document
    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
    let {id} = req.params;
    req.flash("success","Listing Deleted!");
    let deletedlisting = await Listing.findByIdAndDelete(id);
    //console.log(deletedlisting);
    res.redirect("/listings");
}