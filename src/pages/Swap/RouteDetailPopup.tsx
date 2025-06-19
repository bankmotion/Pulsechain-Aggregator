import { FaArrowRight } from "react-icons/fa";
import { useAppSelector } from "../../store/hooks";

const RouteDetailsPopup = () => {
  const { fromToken, toToken, quote, allChains } = useAppSelector(
    (state) => state.swap
  );
  return (
    <div className="w-full">
      <div className="mb-4">
        <span className="font-semibold text-lg">Route Details</span>
      </div>
      {quote?.route.map((route, index) => (
        <div
          className="flex items-center justify-between gap-2 mb-2"
          key={index}
        >
          {/* Start Token */}
          <div className="flex flex-col items-center">
            <img
              src={fromToken?.image}
              alt={"chainlogo"}
              className="w-8 h-8 mb-1 rounded-full"
            />
            <span className="text-xs font-bold">{route.percent}%</span>
          </div>
          {/* Route Steps */}
          <div className="flex-1 flex items-center justify-between gap-2">
            {route.subroutes.map((subroute, index) => (
              <>
                <div className="flex flex-col items-center bg-[#23263b] rounded-xl px-4 py-2 min-w-[200px]">
                  {subroute.paths.map((path, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between w-full py-1"
                    >
                      <span className="text-xs font-semibold">
                        {path.tokens[0].symbol}
                        <span className="mx-1 text-gray-400">→</span>
                        {path.tokens[1].symbol}
                      </span>
                      <span className="text-xs text-gray-400 mx-2">{path.exchange}</span>
                      <span className="text-xs font-bold text-right">{path.percent}%</span>
                    </div>
                  ))}
                </div>
                {index !== route.subroutes.length - 1 && (
                  <FaArrowRight className="text-gray-400" key={index} />
                )}
              </>
            ))}
          </div>
          {/* End Token */}
          <div className="flex flex-col items-center">
            <img
              src={toToken?.image}
              alt="toToken"
              className="w-8 h-8 mb-1 rounded-full"
            />
          </div>
        </div>
      ))}
      <hr className="border-[#23263b] my-3" />
      <div className="text-xs text-gray-400">
        This route optimizes your total output by considering split routes,
        multi-hops, and the gas cost of each step.
      </div>
    </div>
  );
};

export default RouteDetailsPopup;
