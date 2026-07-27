import { Redirect, Route, Switch } from "wouter"
import { LoginScreen } from "@/screens/LoginScreen"
import { MainScreen } from "@/screens/MainScreen"
import { SignupScreen } from "@/screens/SignupScreen"
import { CreateSoccerFieldScreen } from "@/screens/CreateSoccerFieldScreen.tsx"
import { CreateReservationScreen } from "@/screens/CreateReservationScreen"
import { useToken } from "@/services/TokenContext"
import { ProfileScreen } from "@/screens/ProfileScreen"
import { MyReservationsScreen } from "@/screens/MyReservationsScreen"
import { MyTeamsScreen } from "@/screens/MyTeamsScreen"
import {CreateTeamScreen} from "@/screens/CreateTeamScreen.tsx";
import { TournamentsScreen } from "@/screens/TournamentsScreen"
import { CreateTournamentScreen } from "@/screens/CreateTournamentScreen"
import { EditTournamentScreen } from "@/screens/EditTournamentScreen"
import { PublicMatchesScreen } from "@/screens/PublicMatchesScreen"
import {TournamentSearchScreen} from "@/screens/TournamentsSearchScreen.tsx";

export const Navigation = () => {
    const [tokenState] = useToken()
    return (
        <Switch>
            {tokenState.state === "LOGGED_IN" && tokenState.role === "OWNER" && (
                <>
                    <Route path="/soccer-fields/create">
                        <CreateSoccerFieldScreen />
                    </Route>
                    <Route path="/soccer-fields">
                        <MyReservationsScreen />
                    </Route>
                    <Route path="/">
                        <MainScreen />
                    </Route>
                    <Route path="/profile">
                        <ProfileScreen />
                    </Route>
                    <Route>
                        <Redirect href="/" />
                    </Route>
                </>
            )}

            {tokenState.state === "LOGGED_IN" && tokenState.role === "USER" && (
                <>
                    <Route path="/soccer-fields/reservations/create">
                        <CreateReservationScreen />
                    </Route>
                    <Route path="/my-reservations">
                        <MyReservationsScreen />
                    </Route>
                    <Route path="/my-teams">
                        <MyTeamsScreen />
                    </Route>
                    <Route path="/soccer-fields/create-team">
                        <CreateTeamScreen />
                    </Route>
                    <Route path="/public-matches">
                        <PublicMatchesScreen />
                    </Route>
                    <Route path="/tournaments">
                        <TournamentsScreen />
                    </Route>
                    <Route path="/tournaments/search">
                        <TournamentSearchScreen />
                    </Route>
                    <Route path="/tournaments/create">
                        <CreateTournamentScreen />
                    </Route>
                    <Route path="/tournaments/:id/edit">
                        {(params) => <EditTournamentScreen params={params} />}
                    </Route>
                    <Route path="/">
                        <MainScreen />
                    </Route>
                    <Route path="/profile">
                        <ProfileScreen />
                    </Route>
                    <Route>
                        <Redirect href="/" />
                    </Route>
                </>
            )}

            {tokenState.state === "LOGGED_IN" && tokenState.role === "ADMIN" && (
                <>
                    <Route path="/soccer-fields">
                        <MyReservationsScreen />
                    </Route>
                    <Route path="/">
                        <MainScreen />
                    </Route>
                    <Route path="/profile">
                        <ProfileScreen />
                    </Route>
                    <Route>
                        <Redirect href="/" />
                    </Route>
                </>
            )}

            {tokenState.state === "LOGGED_OUT" && (
                <>
                    <Route path="/">
                        <MainScreen />
                    </Route>
                    <Route path="/login">
                        <LoginScreen />
                    </Route>
                    <Route path="/signup">
                        <SignupScreen />
                    </Route>
                    <Route>
                        <Redirect href="/" />
                    </Route>
                </>
            )}
        </Switch>
    )
}
