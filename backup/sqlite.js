const { Sequelize, Model, DataTypes } = require('sequelize');
const path = require('path')
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite')
});


class User extends Model {}
User.init({
  username: DataTypes.STRING,
  birthday: DataTypes.DATE

}, { sequelize, modelName: 'user' });


module.exports = async () => {
    await sequelize.sync();
    const jane = await User.create({
      username: 'janedoe',
      birthday: new Date(1980, 6, 20)
    });
    console.log(jane.toJSON());
}