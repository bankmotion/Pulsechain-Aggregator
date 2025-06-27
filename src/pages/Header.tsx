import { motion } from "framer-motion";
import CustomConnectButton from "../components/CustomConnectButton";

const Header = () => {
  return (
    <motion.div
      initial={{ y: -20 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      className="w-full h-[100px] flex items-center justify-between px-6"
    >
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2"
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 bg-green-400 rounded-full cursor-pointer"
          />
          <span className="font-bold text-lg">Rubic</span>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#3a3f5a" }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#2b2e4a] px-3 py-2 rounded-xl"
        >
          ☰
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#3a3f5a" }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#2b2e4a] px-4 py-2 rounded-xl"
        >
          Swaps
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#3a3f5a" }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#2b2e4a] px-4 py-2 rounded-xl"
        >
          Testnets
        </motion.button>
      </div>
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-8 h-8 rounded-full bg-gray-500 cursor-pointer"
        />
        <motion.div
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
          className="w-8 h-8 rounded-full bg-gray-600 cursor-pointer"
        />
        <CustomConnectButton />
      </div>
    </motion.div>
  );
};

export default Header;
