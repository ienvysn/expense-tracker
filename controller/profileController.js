const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    req.user.password = password;
    await req.user.save();
    res.status(200).send({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    req.user.username = username;
    await req.user.save();
    res.status(200).send({ message: "Username updated successfully" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
};

module.exports = { updatePassword, updateUsername };
