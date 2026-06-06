const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

/*main().then(() => {
    console.log("connected to DB");
}).catch(err => {
    console.log(err);
});*/

async function main() {
    await mongoose.connect(MONGO_URL);
};

main().then(() => {
    console.log("Connected to DB");

    app.listen(8080, () => {
        console.log("Server is listening on port 8080");
    });
})
.catch(err => {
    console.log(err);
});

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static('public'));


app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).lean();
    allListings.forEach(listing => {
        if(listing.image) {
            listing.image = listing.image.url;
        } else {
            listing.image = null;
        }
    });
    res.render("./listings/index.ejs", {allListings});
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs")
})

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (typeof id !== "string" || id.includes("[object")) {
    return res.send("Invalid ID received");
    }
    //console.log("ID:", id);
    //console.log("Type:", typeof id);
    const listing = await Listing.findById(id);
    res.render("./listings/show.ejs", { listing });
}));

/*//Create Route
app.post("/listings", async (req, res) => {
    try {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    } catch (err){
        next(err);
    }

}); */

//Create Route
app.post("./listings",validateListing, wrapAsync(async (req, res, next) => {
   /* if (!req.body.listing) {
        throw new ExpressError(400, "Send valid data for listing");
        
    } */
 
  const newListing = new Listing({
    title: listingData.title,
    description: listingData.description,
    price: listingData.price,
    location: listingData.location,
    country: listingData.country,
    image: {
      url: listingData.image.url   // 🔴 IMPORTANT
    }
  });
  await newListing.save();
  res.redirect("/listings");
}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id",validateListing, wrapAsync(async (req, res) => {
   /* if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
    } */
    const { id } = req.params; 
    let listing = await Listing.findById(id);
    //let {id} = req.params;
    //If image is empty, keep old image
    if (req.body.listing.image && req.body.listing.image.url.trim() !== "") {
        listing.image.url = req.body.listing.image.url;
    }

    //update other fields
    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    await listing.save();
    res.redirect(`/listings/${id}`);
    /*await Listing.findByIdAndUpdate(id, req.body.listing  {...req.body.listing});
    res.redirect(`/listings/${id}`);*/
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));



/* app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing({
        title: "My New Villa",
        description: "By the Beach",
        price: 1200,
        location: "Calangute, Goa",
        country: "India",
    });

    await sampleListing.save();
    console.log("sample was saved");
    res.send("successful testing");
}); */

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  //res.status(statusCode).send(message);
});

/*app.all( "*" , (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});*/

/*app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});*/

/*app.use((err, req, res, next) => {
    let {statusCode, message} = err;
    res.status(statusCode).send(message);
});*/

/*app.listen(8080, () => {
    console.log("server is listening to port 8080");
});*/
