const mongoose = require('mongoose');

main().then(() => {
    console.log("Connection successfull");
})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/amazon');
}

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxlength: 20,
    },
    author: {
        type: String,
    },
    price: {
        type: Number,
        min: [1, "Price is too low for amazon selling"],
    },
    discount: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        enum: ["fiction", "non-fiction"],
    },
    genre: [String]
});

const book = mongoose.model("Book", bookSchema);

book.findByIdAndUpdate("68ab1cce99039913916525c1", {price: -100}, {runValidators: true}).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err.errors.price.properties.message);
});

// let book1 = new book({
//     title: "Marvel Comics V2",
//     price: 600,
//     genre: ["Comics", "Superheroes", "Fiction"]
// })
// book1.save().then((res) => {
//     console.log(res);
// }).catch((err) => {
//     console.log(err);
// });


