import { loadEnvConfig } from "@next/env";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { stdin, stdout } from "node:process";
import readline from "node:readline/promises";

import { User } from "../src/models/User";

loadEnvConfig(process.cwd());

const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

async function main() {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI not found in environment variables");
    }

    await mongoose.connect(mongoUri);

    console.log(`Connected to database: ${mongoose.connection.name}`);

    const email = (await rl.question("Admin email: ")).trim().toLowerCase();

    const name = await rl.question("Admin name: ");
    const password = await rl.question("Admin password: ");

    if (!email || !name || !password) {
      throw new Error("Email, name and password are required.");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters.");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("\nThis email already exists.");
      console.log("No changes were made.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await User.create({
      name,
      email,
      password: passwordHash,
      role: "admin",
      phone: "",
      addresses: [],
      dentacoins: 5000,
      membershipTier: "plus",
      wishlist: [],
    });

    console.log("\n==================================");
    console.log("ADMIN CREATED SUCCESSFULLY");
    console.log("==================================");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Database:", mongoose.connection.name);
    console.log("==================================");
  } catch (error) {
    console.error("\nError:", error);
  } finally {
    await mongoose.disconnect();
    rl.close();
  }
}

main();
