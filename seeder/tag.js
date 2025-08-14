const db = require('../database');

function seedTag(name){
    const checkquery = "SELECT COUNT(*) AS count FROM tags WHERE name = ?";
    db.db.get(checkquery, [name], (err, row) => {
        if(err) {
            console.error(`error cek tag '${name}':`, err.message);
            return;
        }
        if(row.count > 0) {
            console.log(`Tag '${name}'sudah ada, skipp.`);
            return;
        }
        else {
            db.addTag(name, (result) => {
                console.log(`Tag '${name}' ditambahkan:`, result);
            });
        }
    });
}

["Coding", "Meeting", "Design", "Research", "Presentation", "Laundry", "Cleaning", "Maintenance", "Gaming", "Bill"].forEach(seedTag);