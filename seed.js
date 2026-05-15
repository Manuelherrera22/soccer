const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://otnsrcgnikoxmrwkemls.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90bnNyY2duaWtveG1yd2tlbWxzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODgyOTI5MiwiZXhwIjoyMDk0NDA1MjkyfQ.mersCqu30WcLSiVW8CggKdX6Nfl3v5h8oAMeJSl7MCU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Limpiando la base de datos...");
    // Clear existing matches
    await supabase.from('matches').delete().neq('id', 0);
    // Clear existing participants
    await supabase.from('participants').delete().neq('id', 0);

    const names = ["Carlos", "Maria", "Juan", "Ana", "Luis", "Elena", "Pedro", "Sofia", "Miguel", "Lucia", "Jose", "Laura", "Jorge", "Carmen", "David", "Paula", "Diego", "Marta", "Daniel", "Sara", "Fernando", "Valeria", "Ricardo", "Camila", "Andres", "Isabella", "Alejandro", "Valentina", "Manuel", "Gabriela"];
    const surnames = ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Ruiz", "Hernandez", "Diaz", "Alvarez", "Moreno", "Munoz", "Romero", "Alonso", "Gutierrez", "Navarro"];

    let participants = [];
    console.log("Generando 64 participantes falsos...");
    
    for (let i = 0; i < 64; i++) {
        const name = `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
        const isMinor = Math.random() > 0.8;
        
        participants.push({
            fullName: name,
            tariff: Math.random() > 0.3 ? 'general' : 'client',
            birthDate: isMinor ? '2010-05-15' : '1995-08-22',
            phone: `7${Math.floor(Math.random() * 8999999) + 1000000}`,
            email: `player_${Date.now()}_${i}@test.com`,
            isDaviviendaClient: Math.random() > 0.8,
            isTigoClient: Math.random() > 0.8,
            isMinor: isMinor,
            guardianName: isMinor ? `Encargado de ${name}` : null,
            guardianPhone: isMinor ? `7${Math.floor(Math.random() * 8999999) + 1000000}` : null,
            guardianDui: isMinor ? `0${Math.floor(Math.random() * 89999999)}-0` : null,
            acceptedTerms: true
        });
    }

    const { error } = await supabase.from('participants').insert(participants);
    
    if (error) {
        console.error("Error al insertar los participantes:", error);
    } else {
        console.log(`✅ ¡Se insertaron 64 participantes falsos exitosamente!`);
        console.log("Revisa http://localhost:3005/admin y dale click a 'Generar Llaves'");
    }
}

seed();
