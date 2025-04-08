let mongoose = require('mongoose');
let bcrypt = require('bcrypt');
let userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  fullName: { type: String, default: "" },
  avatarUrl: { type: String, default: "" },
  status: { type: Boolean, default: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  loginCount: { type: Number, default: 0, min: 0 },
  isDeleted: {
    type: Boolean,
    default: false
},
ResetPasswordToken: String,
ResetPasswordTokenExp: Date
},{
    timestamps:true,
});

// mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
userSchema.pre('save', function (next) {
  if (this.isModified('password')) {
      let salt = bcrypt.genSaltSync(10);
      let hash = bcrypt.hashSync(this.password, salt);
      this.password = hash;
  }
  next();
})

module.exports = mongoose.model('User', userSchema);