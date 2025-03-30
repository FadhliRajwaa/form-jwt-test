const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb+srv://rajwaarahmana45:123abc789@cluster0.cp7fh.mongodb.net/jwt_test?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = mongoose.model('User', userSchema);

const seedUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('123', 10);
    const user = new User({
      username: 'fadhli',
      password: hashedPassword,
      email: 'fadhlirajwaarahmana@gmail.com'
    });
    await user.save();
    console.log('User berhasil ditambahkan');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding user:', err);
  }
};

seedUser();