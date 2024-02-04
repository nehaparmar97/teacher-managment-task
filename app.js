
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const fs=require('fs');


const app = express();

// Set the view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Use the body-parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'views')));

let teachers = [];

// Function to load teacher records from JSON file
function loadTeachersFromFile() {
    try {
        const data = fs.readFileSync('teacher.json', 'utf8');
        teachers = JSON.parse(data);
    } catch (err) {
        console.error("Error reading or parsing teacher.json:", err);
    }

    if (!Array.isArray(teachers)) {
        teachers = [];
    }
}

// Load teacher records from file when the server starts
loadTeachersFromFile();

// Define routes
app.get("/", function (req, res) {
    console.log("Data sent to the view:", teachers);
    res.render("home", { data: teachers });
  });

app.post("/", (req, res) => {
  const name = req.body.name;
 const age=req.body.age;
 const dateOfBirth=req.body.dateOfBirth;
 const subject_taught=req.body.subject_taught;

 
  teachers.push({
    name: name,
    age:age,
    dateOfBirth:dateOfBirth,
    subject_taught:subject_taught
  });

  saveteachersToFile();
  res.render("home", {
    data: teachers
  });
  res.json({ message: 'Teacher added successfully', teacher: teachers });
});


// Update function
// app.post('/update', (req, res) => {
//     const requestedRollNo = req.body.rollNo;
//     const newRoomNo = req.body.newroomno;
  
//     const teacher = teachers.find(s => s.rollNo == requestedRollNo);
  
//     if (teacher) {
//       teacher.roomNo = newRoomNo;
//     }
  
//     res.render("home", {
//       data: teachers
//     });
//   });
  
  // Delete function
  app.post('/delete', (req, res) => {
    
    const requestedName = req.body.name;
    console.log(requestedName);
    const index = teachers.findIndex((teacher) => teacher.name === requestedName);
    if (index !== -1) {
      teachers.splice(index, 1);
    }
  
    saveteachersToFile();
    res.render("home", {
      data: teachers
    });
  });
  
app.post('/search',(req,res)=>{
    const searchName=req.body.name;
    const foundTeachers = teachers.filter(teacher => teacher.name.toLowerCase().includes(searchName.toLowerCase()) );
    const showAlert = foundTeachers.length === 0;

    res.render("home", {
        data: foundTeachers,
        showAlert: showAlert
    });
})

app.post('/update',(req,res)=>{
    const oldname=req.body.name;
    const newage=req.body.newage;
    const newname=req.body.newname;
    const newdob=req.body.newdob;
    const newsubject=req.body.newsubject;

    const teacherToUpdate = teachers.find(teacher => teacher.name === oldname);
    if (teacherToUpdate) {
        // Update the teacher's properties
        teacherToUpdate.name = newname;
        teacherToUpdate.age = newage;
        teacherToUpdate.dateOfBirth=newdob;
        teacherToUpdate.subject_taught=newsubject;


        // Save the updated data back to teacher.json
        fs.writeFileSync('teacher.json', JSON.stringify(teachers, null, 2), 'utf-8');
    }

    res.render("home", {
        data: teachers
    });
    
})


app.post('/filter', (req, res) => {
  const selectFilter = req.body.filterby;
  console.log(selectFilter);

  let filteredTeachers = [...teachers];  // Create a new array for filtered data
  if(selectFilter=="Age")
      {
        filteredTeachers.sort((a, b) => a.age - b.age);
      }
  else if (selectFilter === "Age below 50") {
      filteredTeachers = filteredTeachers.filter(teacher => teacher.age < 50);
  } else if (selectFilter === "Age above 50") {
      filteredTeachers = filteredTeachers.filter(teacher => teacher.age >= 50);
  } else if (selectFilter === "subjectTaught") {
      filteredTeachers.sort((a, b) => a.subject_taught - b.subject_taught);
  }

  res.render("home", {
      data: filteredTeachers,
      filterby: selectFilter
  });
});
app.get('/avg',(req,res)=>{
  
if(teachers.length===0)
{
  res.json({error:'Number of teachers are zero'});
}
else 
{
  let avgsub=teachers.reduce((acc,teacher)=>acc+parseInt(teacher.subject_taught),0);
  avgsub=avgsub/teachers.length;
  res.render("home", { data:teachers,avgsub: avgsub.toFixed(2) });
 
}
})

  function saveteachersToFile() {
    fs.writeFile('teacher.json', JSON.stringify(teachers, null, 2), (err) => {
      if (err) {
        console.error('Error writing teachers to file:', err);
      } else {
        console.log('teachers saved to file successfully.');
      }
    });
  }

// Create an HTTP server
const server = http.createServer(app);

// Listen on port 3000
server.listen(3000, () => {
  console.log("App is running on http://localhost:3000");
});
