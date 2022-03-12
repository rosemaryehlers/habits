package httptemplate

import (
	"context"
//	"crypto/rsa"
//	"encoding/binary"
//	"encoding/json"
//	"fmt"
//	"io/ioutil"
	"log"
	"net/http"
//	"os"
//	"strconv"
//	"time"

//	"github.com/duo-labs/webauthn/protocol"
//	"github.com/duo-labs/webauthn/webauthn"
//	"github.com/golang-jwt/jwt/v4"
//	"github.com/prometheus/client_golang/prometheus/promhttp"
//	"github.com/spf13/viper"
)

type ServerConfig struct {
	// Jwt struct {
	// 	Name   string
	// 	Domain string
	// 	Secure bool
	// 	MaxAge int
	// }

	// PrivateKey *rsa.PrivateKey
	// InviteTTL  time.Duration
}

type server struct {
	// db     *Repository
	// redis  *Redis
	// users  *UsersClient
	router *Router
	http   *http.Server
	// wa     *WebAuthn

	config ServerConfig
}

func (s *server) Reload() ConfigFunc {
	return func() {
		// s.config.Jwt.Name = viper.GetString("JWT.Name")
		// s.config.Jwt.Domain = viper.GetString("JWT.Domain")
		// s.config.Jwt.Secure = viper.GetBool("JWT.Secure")
		// s.config.Jwt.MaxAge = viper.GetInt("JWT.MaxAge")

		// s.config.InviteTTL = viper.GetDuration("Invite.Timeout")

		// keyData, err := ioutil.ReadFile(os.Getenv("PRIVATE_KEY"))
		// if err != nil {
		// 	panic(fmt.Sprintf("Failed to read private key file: %v", err))
		// }

		// privateKey, err := jwt.ParseRSAPrivateKeyFromPEM(keyData)
		// if err != nil {
		// 	panic(fmt.Sprintf("Failed to parse private key: %v", err))
		// }

		// s.config.PrivateKey = privateKey
	}
}

func (s *server) Start() {
	s.http = &http.Server{
		Addr:    ":80",
		Handler: s.router,
	}

	log.Printf("HTTP server listening")
	go func() {
		if err := s.http.ListenAndServe(); err != nil {
			if err.Error() != "http: Server closed" {
				log.Printf("HTTP server closed with: %v\n", err)
			}
			log.Printf("HTTP server shut down")
		}
	}()
}

func (s *server) Stop() {
	if s.http != nil {
		s.http.Shutdown(context.Background())
	}
}

func (s *server) CheckHealth() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}
}

func (s *server) routes() {
	s.router.HandleFunc("GET", "/health", s.CheckHealth())
	//s.router.HandleFunc("GET", "/metrics", promhttp.Handler().ServeHTTP)

	// s.router.HandleFunc("GET", "/v1/register/:username", HttpMetrics(s.BeginRegistration()))
	// s.router.HandleFunc("POST", "/v1/register/:username", HttpMetrics(s.FinishRegistration()))
	// s.router.HandleFunc("GET", "/v1/login/:username", HttpMetrics(s.BeginLogin()))
	// s.router.HandleFunc("POST", "/v1/login/:username", HttpMetrics(s.FinishLogin()))

	// s.router.HandleFunc("GET", "/v1/auth", HttpMetrics(s.WhoAmI()))
	// s.router.HandleFunc("DELETE", "/v1/auth", HttpMetrics(s.Logout()))
	// s.router.HandleFunc("GET", "/v1/auth/invite", HttpMetrics(s.Invite()))
}

//implements https://github.com/duo-labs/webauthn/blob/master/webauthn/user.go
/* type WebAuthnUser struct {
	User
	Credentials []webauthn.Credential
}

func NewWebAuthnUser(u User, c []Credential) *WebAuthnUser {
	webauthnUser := WebAuthnUser{
		User:        u,
		Credentials: []webauthn.Credential{},
	}

	for _, credential := range c {
		webauthnUser.Credentials = append(
			webauthnUser.Credentials,
			webauthn.Credential{
				ID:              credential.Id,
				PublicKey:       credential.PublicKey,
				AttestationType: credential.AttestationType,
				Authenticator: webauthn.Authenticator{
					AAGUID:    credential.AAGuid,
					SignCount: credential.Counter,
				},
			},
		)
	}

	return &webauthnUser
}

func (u WebAuthnUser) WebAuthnID() []byte {
	buf := make([]byte, binary.MaxVarintLen64)
	binary.PutUvarint(buf, uint64(u.Id))
	return buf
}

func (u WebAuthnUser) WebAuthnName() string {
	return u.Name
}

func (u WebAuthnUser) WebAuthnDisplayName() string {
	return u.Name
}

func (u WebAuthnUser) WebAuthnIcon() string {
	return ""
}

func (u WebAuthnUser) WebAuthnCredentials() []webauthn.Credential {
	return u.Credentials
}

func (s *server) Invite() http.HandlerFunc {
	type Response struct {
		Nonce string `json:"token"`
	}

	return func(w http.ResponseWriter, r *http.Request) {
		nonce, err := s.redis.MintNonce(s.config.InviteTTL)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(Response{nonce})
		if err != nil {
			log.Println(err)
		}
	}
}

func (s *server) BeginRegistration() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//get nonce
		query := r.URL.Query()
		nonce, present := query["token"]
		if !present {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		//validate nonce
		err := s.redis.ConsumeNonce(nonce[0])
		if err != nil {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		//get user
		user, err := s.users.GetUserByName(Param(r.Context(), "username"))
		if err != nil {
			if err != NotFoundError {
				w.WriteHeader(http.StatusServiceUnavailable)
				log.Println(err)
				return
			}

			//create user
			user, err = s.users.Create(Param(r.Context(), "username"))
			if err != nil {
				if err == ConflictError {
					w.WriteHeader(http.StatusServiceUnavailable)
					return
				}
				w.WriteHeader(http.StatusServiceUnavailable)
				log.Println(err)
				return
			}
		}

		//populate credentials
		credentials, err := s.db.Get(user.Id)
		if err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			log.Println(err)
			return
		}

		if len(credentials) > 0 {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		webauthnUser := NewWebAuthnUser(*user, credentials)

		// generate PublicKeyCredentialCreationOptions, sessionData
		options, sessionData, err := s.wa.WebAuthn.BeginRegistration(
			webauthnUser,
			func(credCreationOpts *protocol.PublicKeyCredentialCreationOptions) {
				credentialExcludeList := []protocol.CredentialDescriptor{}
				for _, cred := range webauthnUser.Credentials {
					descriptor := protocol.CredentialDescriptor{
						Type:         protocol.PublicKeyCredentialType,
						CredentialID: cred.ID,
					}
					credentialExcludeList = append(credentialExcludeList, descriptor)
				}

				credCreationOpts.CredentialExcludeList = credentialExcludeList
			},
		)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		// store sessionData
		sessionDataJson, err := json.Marshal(sessionData)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}
		s.redis.Client.Set(context.Background(), sessionData.Challenge, sessionDataJson, time.Second*time.Duration(s.wa.WebAuthn.Config.Timeout))

		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(options)
		if err != nil {
			log.Println(err)
		}
	}
}

func (s *server) FinishRegistration() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// get user
		user, err := s.users.GetUserByName(Param(r.Context(), "username"))
		switch {
		case err == NotFoundError:
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		credentials, err := s.db.Get(user.Id)
		if err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}

		webauthnUser := NewWebAuthnUser(*user, credentials)

		// load the session data
		parsedResponse, err := protocol.ParseCredentialCreationResponse(r)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		sessionJson, err := s.redis.Client.Get(context.Background(), parsedResponse.Response.CollectedClientData.Challenge).Result()
		if err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			log.Println(err)
			return
		}
		var session webauthn.SessionData
		err = json.Unmarshal([]byte(sessionJson), &session)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		webauthnCredential, err := s.wa.WebAuthn.CreateCredential(webauthnUser, session, parsedResponse)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		//save credential
		err = s.db.Create(Credential{
			Id:              webauthnCredential.ID,
			UserId:          webauthnUser.Id,
			PublicKey:       webauthnCredential.PublicKey,
			AttestationType: webauthnCredential.AttestationType,
			AAGuid:          webauthnCredential.Authenticator.AAGUID,
			Counter:         webauthnCredential.Authenticator.SignCount,
		})
		switch {
		case err == DatabaseConnectionError:
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		case err == DatabaseExistsError:
			w.WriteHeader(http.StatusBadRequest)
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		err = s.SetAuthCookie(user.Id, w)
		if err != nil {
			log.Println(err)
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *server) BeginLogin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// get user
		user, err := s.users.GetUserByName(Param(r.Context(), "username"))
		switch {
		case err == NotFoundError:
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		credentials, err := s.db.Get(user.Id)
		if err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}

		webauthnUser := NewWebAuthnUser(*user, credentials)

		// generate PublicKeyCredentialRequestOptions, session data
		options, sessionData, err := s.wa.WebAuthn.BeginLogin(webauthnUser)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		// store sessionData
		sessionDataJson, err := json.Marshal(sessionData)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}
		s.redis.Client.Set(context.Background(), sessionData.Challenge, sessionDataJson, time.Second*time.Duration(s.wa.WebAuthn.Config.Timeout))

		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(options)
		if err != nil {
			log.Println(err)
		}
	}
}

func (s *server) FinishLogin() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// get user
		user, err := s.users.GetUserByName(Param(r.Context(), "username"))
		switch {
		case err == NotFoundError:
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		credentials, err := s.db.Get(user.Id)
		if err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			return
		}

		webauthnUser := NewWebAuthnUser(*user, credentials)

		// load the session data
		parsedResponse, err := protocol.ParseCredentialRequestResponse(r)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		sessionJson, err := s.redis.Client.Get(context.Background(), parsedResponse.Response.CollectedClientData.Challenge).Result()
		if err != nil {
			w.WriteHeader(http.StatusServiceUnavailable)
			log.Println(err)
			return
		}
		var session webauthn.SessionData
		err = json.Unmarshal([]byte(sessionJson), &session)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		// in an actual implementation, we should perform additional checks on
		// the returned 'credential', i.e. check 'credential.Authenticator.CloneWarning'
		// and then increment the credentials counter
		_, err = s.wa.WebAuthn.ValidateLogin(webauthnUser, session, parsedResponse)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		err = s.SetAuthCookie(user.Id, w)
		if err != nil {
			log.Println(err)
		}
		w.WriteHeader(http.StatusNoContent)
	}
}

func (s *server) WhoAmI() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		//check cookie
		cookie, err := r.Cookie(s.config.Jwt.Name)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		token, err := jwt.ParseWithClaims(cookie.Value, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
			}

			return s.config.PrivateKey.Public(), nil
		})
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		claims, ok := token.Claims.(*jwt.RegisteredClaims)
		if !ok || !token.Valid {
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		userid, err := strconv.ParseUint(claims.Subject, 10, 64)
		if err != nil {
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		}

		user, err := s.users.GetUserById(userid)
		switch {
		case err == NotFoundError:
			w.WriteHeader(http.StatusBadRequest)
			log.Println(err)
			return
		case err != nil:
			w.WriteHeader(http.StatusInternalServerError)
			log.Println(err)
			return
		}

		w.WriteHeader(http.StatusOK)
		err = json.NewEncoder(w).Encode(user)
		if err != nil {
			log.Println(err)
		}
	}
}

func (s *server) Logout() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		http.SetCookie(w, &http.Cookie{
			Name:     s.config.Jwt.Name,
			Domain:   s.config.Jwt.Domain,
			MaxAge:   -1,
			Secure:   s.config.Jwt.Secure,
			Path:     "/",
			HttpOnly: true,
		})

		w.WriteHeader(http.StatusUnauthorized)
	}
}

func (s *server) SetAuthCookie(userid uint64, w http.ResponseWriter) error {
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, &jwt.RegisteredClaims{Subject: fmt.Sprintf("%v", userid), ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Second * time.Duration(s.config.Jwt.MaxAge)))})
	cookie, err := token.SignedString(s.config.PrivateKey)
	if err != nil {
		return err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     s.config.Jwt.Name,
		Value:    cookie,
		Domain:   s.config.Jwt.Domain,
		MaxAge:   s.config.Jwt.MaxAge,
		Secure:   s.config.Jwt.Secure,
		Path:     "/",
		HttpOnly: true,
	})

	return nil
} */