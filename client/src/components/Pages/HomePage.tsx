import { authSignin } from "@/features/userSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "react-hot-toast/headless";
import { useDispatch } from "react-redux";
import axios from "../../axios/axios";

type FormState = {
  fname: string;
  lname: string;
  email: string;
  password: string;
  confirmPassword: string;
  pic: File | null;
};

const HomePage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(false);
  const [data, setData] = useState<FormState>({
    fname: "",
    lname: "",
    email: "",
    password: "",
    confirmPassword: "",
    pic: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleClick = async () => {
    try {
      setLoading(true);
      if (!user) {
        const formdata = new FormData();
        if (data.pic) {
          formdata.append("pic", data.pic);
        }
        formdata.append("fname", data.fname);
        formdata.append("lname", data.lname);
        formdata.append("email", data.email);
        formdata.append("password", data.password);
        formdata.append("confirmPassword", data.confirmPassword);

        const res = await axios.post("/user/signup", formdata);
        dispatch(authSignin(res.data));
      } else {
        const newData = {
          email: data.email,
          password: data.password,
        };
        const res = await axios.post("/user/login", newData);
        dispatch(authSignin(res.data));
      }
      window.location.assign("/chats");
      toast.success("success");
    } catch (err) {
      toast.error("something went wrong");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const upload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, pic: e.target.files?.[0] || null });
  };

  return (
    <div className="">
      <Tabs
        defaultValue="signUp"
        className="m-auto py-12 w-[400px] items-center"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signIn" onClick={() => setUser(true)}>
            Sign In
          </TabsTrigger>
          <TabsTrigger value="signUp" onClick={() => setUser(false)}>
            Sign Up
          </TabsTrigger>
        </TabsList>
        <TabsContent value="signIn">
          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Sign In here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  onChange={handleChange}
                  name="email"
                  type="email"
                  placeholder="example@abc.com"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  onChange={handleChange}
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Password here"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleClick}
                variant="outline"
                disabled={loading}
              >
                Sign In
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="signUp">
          <Card>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Sign Up here</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="fname">First Name</Label>
                <Input
                  id="fname"
                  onChange={handleChange}
                  name="fname"
                  placeholder="First Name"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lname">Last Name</Label>
                <Input
                  id="lname"
                  name="lname"
                  placeholder="Last Name"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  onChange={handleChange}
                  placeholder="example@abc.com"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  onChange={handleChange}
                  name="password"
                  type="password"
                  placeholder="Password"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cPassword">Confirm Password</Label>
                <Input
                  onChange={handleChange}
                  name="confirmPassword"
                  id="cPassword"
                  type="password"
                  placeholder="Confirm Password"
                />
              </div>
              <div>
                <Label htmlFor="chooseAvatar">Profile Picture</Label>
                <Input
                  id="chooseAvatar"
                  onChange={upload}
                  name="pic"
                  type="file"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={loading}
                variant="outline"
                onClick={handleClick}
              >
                Sign Up
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomePage;
