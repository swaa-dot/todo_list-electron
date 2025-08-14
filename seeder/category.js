const db = require('../database');

function seedCategory(name){
    const checkquery = "SELECT COUNT(*) AS count FROM categories WHERE name = ?";
    db.db.get(checkquery, [name], (err, row) => {
        if(err) {
            console.error(`error cek kategori ${name}':`, err.message);
            return;
        }
        if(row.count > 0) {
            console.log(`Category '${name}'sudah ada, skipp.`);
            return;
        }
        else {
            db.addCategory(name, (result) => {
                console.log(`Category '${name}' ditambahkan:`, result);
            });
        }
    });
}

["work", "personal", "social", "home", "study"].forEach(seedCategory);

