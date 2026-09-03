import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { Store } from '../Store';
import { toast } from 'react-toastify';

const defaultLocation = {
  lat: -17.3895,
  lng: -66.1568,
};

export default function MapScreen() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { cart } = state;
  const navigate = useNavigate();

  const [location, setLocation] = useState(
    cart.shippingAddress?.location || defaultLocation
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getUserCurrentLocation();
  }, []);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        'La geolocalización no está disponible en este navegador.'
      );
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setLocation(newLocation);
        setLoading(false);

        toast.success('Ubicación actual obtenida');
      },
      (error) => {
        setLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              'Debes permitir el acceso a tu ubicación en el navegador.'
            );
            break;

          case error.POSITION_UNAVAILABLE:
            toast.error('No se pudo obtener tu ubicación.');
            break;

          case error.TIMEOUT:
            toast.error('La solicitud de ubicación tardó demasiado.');
            break;

          default:
            toast.error('No se pudo obtener la ubicación.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const onConfirm = () => {
    ctxDispatch({
      type: 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION',
      payload: {
        lat: location.lat,
        lng: location.lng,
      },
    });

    toast.success('Ubicación guardada correctamente');

    navigate('/shipping');
  };

  return (
    <div className="container my-4">
      <Card>
        <Card.Body>
          <Card.Title>
            Seleccionar ubicación
          </Card.Title>

          <p>
            Puedes utilizar la ubicación actual de tu
            dispositivo para registrar el lugar de entrega.
          </p>

          <div className="my-4 text-center">
            <div
              style={{
                fontSize: '70px',
              }}
            >
              📍
            </div>

            <h4>Ubicación seleccionada</h4>

            <p>
              <strong>Latitud:</strong>{' '}
              {location.lat.toFixed(6)}
              <br />

              <strong>Longitud:</strong>{' '}
              {location.lng.toFixed(6)}
            </p>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={getUserCurrentLocation}
              disabled={loading}
            >
              {loading
                ? 'Obteniendo ubicación...'
                : '📍 Obtener mi ubicación'}
            </Button>

            <Button
              variant="primary"
              type="button"
              onClick={onConfirm}
              disabled={loading}
            >
              ✅ Confirmar ubicación
            </Button>

            <Button
              variant="light"
              type="button"
              onClick={() => navigate('/shipping')}
            >
              Volver a Shipping
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}