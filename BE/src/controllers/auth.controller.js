const authServices = require("../services/auth.service");
const ApiError = require("../api-error");
const JSend = require("../jsend");

async function signUp(req, res, next) {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return next(new ApiError(400, "Email and Password are required"));
    }

    const result = await authServices.registerUser({
      ...req.body,
      AvatarUrl: req.file ? `/public/uploads/avatars/${req.file.filename}` : null,
    });

    if (result.message) {
      return res.status(409).json(JSend.error({ message: result.message })); // Email đã được sử dụng
    }

    return res.status(201).json(
      JSend.success({
        message: "User registered successfully",
        user: result.user,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred during sign up"));
  }
}

async function login(req, res, next) {
  try {
    const { Email, Password } = req.body;
    if (!Email || !Password) {
      return next(new ApiError(400, "Email and Password are required"));
    }

    const result = await authServices.loginUser({ Email, Password });

    if (result.message) {
      return res.status(401).json(JSend.error({ message: result.message })); // Email hoặc mật khẩu không đúng
    }

    return res.status(200).json(
      JSend.success({
        access_token: result.token,
        refresh_token: result.refreshToken,
        user: result.user,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred during login"));
  }
}

async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new ApiError(400, "Refresh token is required"));
    }

    // Kiểm tra refreshToken trong cơ sở dữ liệu hoặc bộ nhớ cache
    const result = await authServices.refreshToken(refreshToken);

    if (result.message) {
      return res.status(403).json(JSend.error({ message: result.message })); // Refresh token không hợp lệ hoặc đã hết hạn
    }

    // Tạo lại accessToken mới
    const newAccessToken = authServices.generateAccessToken(result.user);

    return res.status(200).json(
      JSend.success({
        token: newAccessToken, // Token mới
        refreshToken, // Giữ lại refreshToken hiện tại nếu nó còn hợp lệ
      })
    );
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred during token refresh"));
  }
}


async function getInfo(req, res, next) {

  try {
    const user = await authServices.getInfo(req.user.UserID);
    if (!user) {
      return next(new ApiError(404, "User not found"));
    }
    return res.json(JSend.success({ user }));
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, `Error retrieving user with id=${req.user.UserID}`));
  }
}

module.exports = {
  signUp,
  login,
  refreshToken,
  getInfo
};
