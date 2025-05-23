import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayerStore } from '../usePlayerStore';
import { useQuizConfig } from '../useQuizConfig';
import { quizGameTypes } from '../../../constants/quiztypeconstants';

function isValidQuantity(qty: number, max: number): boolean {
  return qty > 0 && qty <= max;
}

const FundraisingExtrasPanel: React.FC = () => {
  const { players, toggleExtraForPlayer, updateExtraPayment } = usePlayerStore();
  const { config } = useQuizConfig();
  const { roomId } = useParams();

  if (!roomId) return null;

  const selectedType = quizGameTypes.find((t) => t.id === config.gameType);
  const fundraisingLimits = selectedType?.fundraisingOptions || {};

  const isWeb3 = config.paymentMethod === 'web3';
  const enabledExtras = Object.entries(config.fundraisingOptions || {}).filter(([_, enabled]) => enabled);

  const [formState, setFormState] = useState<{
    [playerId: string]: {
      [extraKey: string]: {
        method: 'cash' | 'revolut' | 'other';
        quantity: number;
        confirmed: boolean;
      };
    };
  }>({});

  const handleInputChange = (
    playerId: string,
    extra: string,
    field: 'method' | 'quantity',
    value: string
  ) => {
    setFormState((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [extra]: {
          ...prev[playerId]?.[extra],
          confirmed: false,
          [field]: field === 'quantity' ? parseInt(value, 10) || 0 : value,
        },
      },
    }));
  };

  const handleConfirm = (playerId: string, extra: string, price: number) => {
    const data = formState[playerId]?.[extra];
    if (!data || data.quantity <= 0 || price <= 0) return;

    const maxAllowed = fundraisingLimits[extra]?.maxPerPlayer ?? Infinity;
    if (data.quantity > maxAllowed) {
      alert(`You can only purchase up to ${maxAllowed} of "${extra}".`);
      return;
    }

    const amount = data.quantity * price;

    toggleExtraForPlayer(playerId, extra, roomId);
    updateExtraPayment(playerId, extra, data.method, amount, roomId);

    setFormState((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [extra]: {
          ...prev[playerId][extra],
          confirmed: true,
        },
      },
    }));
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">💡 Fundraising Extras</h2>

      {enabledExtras.length === 0 ? (
        <p className="text-gray-600">No fundraising extras enabled for this quiz.</p>
      ) : players.length === 0 ? (
        <p className="text-gray-600">No players to manage extras for.</p>
      ) : (
        <div className="space-y-6">
          {players.map((player) => (
            <div key={player.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <p className="text-lg font-medium text-gray-800">{player.name}</p>

              {enabledExtras.map(([extra]) => {
                const price = config.fundraisingPrices?.[extra] || 0;
                const form = formState[player.id]?.[extra];
                const quantity = form?.quantity || 0;
                const confirmed = form?.confirmed;
                const maxAllowed = fundraisingLimits[extra]?.maxPerPlayer ?? Infinity;
                const isValid = isValidQuantity(quantity, maxAllowed);
                const totalAmount = quantity * price;

                return (
                  <div key={extra} className="grid sm:grid-cols-6 gap-4 items-center">
                    <div>
                      <label className="font-medium text-gray-700">
                        {extra.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <p className="text-sm text-gray-500">
                        {config.currencySymbol || '€'}{price} each
                      </p>
                    </div>

                    <div>
                      {!isWeb3 && (
                        <input
                          type="number"
                          min={0}
                          placeholder="Qty"
                          value={form?.quantity || ''}
                          onChange={(e) =>
                            handleInputChange(player.id, extra, 'quantity', e.target.value)
                          }
                          className={`w-full border rounded-lg px-3 py-2 text-sm ${
                            isValid || quantity === 0 ? 'border-gray-300' : 'border-red-500'
                          }`}
                        />
                      )}
                    </div>

                   <div>
  {!isWeb3 && (
    <>
      <input
        type="number"
        min={0}
        placeholder="Qty"
        value={form?.quantity || ''}
        onChange={(e) =>
          handleInputChange(player.id, extra, 'quantity', e.target.value)
        }
        className={`w-full border rounded-lg px-3 py-2 text-sm ${
          isValid || quantity === 0 ? 'border-gray-300' : 'border-red-500'
        }`}
      />
      {quantity > maxAllowed && (
        <p className="text-xs text-red-500 mt-1">
          You can purchase a maximum of {maxAllowed} for this extra.
        </p>
      )}
      {!isValid && quantity > 0 && quantity <= maxAllowed && (
        <p className="text-xs text-red-500 mt-1">
          Invalid quantity. Please enter a valid number.
        </p>
      )}
    </>
  )}
</div>


                    <div>
                      {!!form && (
                        <span className="text-gray-800 text-sm">
                          {config.currencySymbol || '€'}{totalAmount.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div>
                      {!!form && (
                        confirmed ? (
                          <span className="text-green-600 font-medium">
                            ✅ {quantity}x {extra.replace(/([A-Z])/g, ' $1')}
                          </span>
                        ) : (
                          <button
                            disabled={!isValid || price === 0}
                            onClick={() => handleConfirm(player.id, extra, price)}
                            className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                              isValid && price > 0
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Add
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FundraisingExtrasPanel;







